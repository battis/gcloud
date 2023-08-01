import { AssociativeArray } from '@battis/typescript-tricks';
import lib from '../lib';
import { SelectOptions } from '../lib/prompts/select';
import shell from '../shell';
import API from './api';

type ServiceIdentifier = string;

type EnableOptions = Partial<SelectOptions> & {
  service?: ServiceIdentifier;
};

type Service = {
  config: {
    authentication: AssociativeArray<string>;
    documentation: AssociativeArray<string>;
    monitoredResources: [{ labels: [{ key: string }]; type: string }];
    monitoring: {
      consumerDestinations: [{ metrics: string[]; monitoredResource: string }];
    };
    name: string;
    quota: AssociativeArray<string>;
    title: string;
    usage: AssociativeArray<string>;
  };
  name: string;
  parent: string;
  state: string;
};

const list = async () => shell.gcloud<Service[]>('services list --available');

export default {
  API,
  list,

  enable: async function(options?: Partial<EnableOptions>) {
    let { service, pageSize = 20 } = options;
    pageSize = Math.max(7, pageSize);
    service = await lib.prompts.select({
      ...options,
      arg: service,
      message: 'Service to enable',
      choices: async () => (await list()).map((service) => service.config),
      nameIn: 'title',
      valueIn: 'name',
      pageSize
    });
    return shell.gcloud(`services enable ${service}`);
  }
};

import cli from '@battis/qui-cli';
import * as lib from '../../lib';
import * as projects from '../../projects';
import * as shell from '../../shell';
import Brand from './Brand';

export const active = new lib.Active<Brand>(undefined);

export async function inputApplicationTitle({
  applicationTitle,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<ApplicationTitle>>[0]> & {
  applicationTitle?: string;
} = {}) {
  return await lib.prompts.input({
    arg: applicationTitle,
    message: 'Application title for OAuth consent dialog',
    validate: cli.validators.combine(validate, cli.validators.notEmpty),
    ...rest
  });
}

export async function inputSupportEmail({
  supportEmail,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<lib.Email>>[0]> & {
  supportEmail?: string;
} = {}) {
  return await lib.prompts.input({
    arg: supportEmail,
    message: 'Support email from OAuth consent dialog',
    validate: cli.validators.combine(validate, cli.validators.email),
    default: supportEmail,
    ...rest
  });
}

export async function create({
  applicationTitle,
  supportEmail,
  project,
  activate = true
}: {
  applicationTitle?: string;
  supportEmail?: lib.Email;
  project?: projects.Project;
  activate?: boolean;
} = {}) {
  project = await projects.selectProject({ project });

  applicationTitle = await inputApplicationTitle({
    applicationTitle,
    default: project.name
  });
  supportEmail = await inputSupportEmail({ supportEmail });

  const brand = await shell.gcloud<Brand>(
    `iap oauth-brands create --application_title=${lib.prompts.escape(
      applicationTitle
    )} --support_email=${supportEmail}`
  );
  if (activate) active.activate(brand);
  return brand;
}

export async function list({
  projectNumber
}: { projectNumber?: number | string } = {}) {
  projectNumber = await projects.selectProjectNumber({ projectNumber });
  return await shell.gcloud<Brand[]>(
    `iap oauth-brands list --filter=name=projects/${projectNumber}/brands/${projectNumber}`
  );
}

export async function selectBrand({
  brand,
  activate,
  activateIfCreated = true,
  ...rest
}: Partial<lib.prompts.select.Parameters<Brand>> &
  Partial<Parameters<typeof create>>[0] & {
    brand?: string;
    activate?: boolean;
  } = {}) {
  return await lib.prompts.select<Brand>({
    arg: brand,
    message: 'IAP OAuth brand',
    choices: async () =>
      (
        await list()
      ).map((b) => ({
        name: b.applicationTitle,
        value: b,
        desription: b.name
      })),
    transform: (b: Brand) => b.name,
    activate: activate && active,
    create,
    activateIfCreated,
    ...rest
  });
}

export const selectIdentifier = selectBrand;

export type ApplicationTitle = string;
export { type Brand };

import { createAddressIfNotExistis } from "../createAddressIfNotExists";
import { createAdminRoleIfNotExist } from "../createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../createMemberRoleIfNotExists";
import { createUserAdminIfNotExists } from "../createUserAdminIfNotExists";
import { createUserClientIfNotExists } from "../createUserClientIfNotExists";
import { createUserIfNotExist } from "../createUserIfNotExists copy";
import { createUserMemberIfNotExists } from "../createUserMemberIfNotExists";
import { userAsAdmin, userAsClient, userAsMember } from "../users";

export const createAllKindOfUserAndRoles = async () => {
  const address = await createAddressIfNotExistis();
  const adminRoleId = await createAdminRoleIfNotExist();
  const clientRoleId = await createClientRoleIfNotExist();
  const memberRoleId = await createMemberRoleIfNotExist();
  const userAdmin = await createUserIfNotExist(adminRoleId, userAsAdmin);
  await createUserAdminIfNotExists(userAdmin);
  const userClient = await createUserIfNotExist(clientRoleId, userAsClient);
  const client = await createUserClientIfNotExists(userClient, address);
  const userMember = await createUserIfNotExist(memberRoleId, userAsMember);
  await createUserMemberIfNotExists(userMember, client);
};

import { getUserContext } from 'packages/authModel/module/user';

export class UnionRoleGuard {
    #unionRoles;

    constructor(...roles) {
        this.#unionRoles = roles.flat();
    }

    canActive(req) {
        const user = getUserContext(req);
        return user.roles
            .some(userRole => this.#unionRoles
                .some(roleMayRequired => roleMayRequired === userRole));
    }
}

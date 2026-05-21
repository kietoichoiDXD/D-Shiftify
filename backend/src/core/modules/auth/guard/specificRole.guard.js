import { getUserContext } from 'packages/authModel/module/user';

export class SpecificRoleGuard {
    #role;

    constructor(role) {
        this.#role = Array.isArray(role) ? role[0] : role;
    }

    canActive(req) {
        const user = getUserContext(req);
        const roleName = this.#role?.name || this.#role;
        return user.roles.some(role => role === roleName);
    }
}

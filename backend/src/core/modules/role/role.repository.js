import { DataRepository } from 'packages/restBuilder/core/dataHandler/data.repository';

class Repository extends DataRepository {
    findByName(name) {
        return this.query()
            .where('name', '=', name)
            .first();
    }
}

export const RoleRepository = new Repository('roles');

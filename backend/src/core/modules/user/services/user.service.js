import { BcryptService } from 'core/modules/auth';
import { getTransaction } from 'core/database';
import { UserRoleRepository } from 'core/modules/role/userRole.repository';
import { joinUserRoles } from 'core/utils/userFilter';
import { logger } from 'core/utils';
import { Optional } from '../../../utils';
import { NotFoundException, DuplicateException, BadRequestException } from '../../../../packages/httpException';
import { UserRepository } from '../user.repository';

class Service {
    constructor() {
        this.repository = UserRepository;
        this.userRoleRepository = UserRoleRepository;
        this.bcryptService = BcryptService;
    }

    async createOne(createUserDto) {
        Optional.of(await this.repository.findByEmail(createUserDto.email)).throwIfPresent(new DuplicateException('Email is being used'));

        if (createUserDto.password !== createUserDto.confirm_password) {
            throw new BadRequestException('Password does not match');
        }

        const trx = await getTransaction();
        try {
            createUserDto.password = this.bcryptService.hash(createUserDto.password);
            delete createUserDto.confirm_password;
            const createdUser = await this.repository.insert(createUserDto, trx);
            const ROLE_USER_ID = 3;
            await this.userRoleRepository.createUserRole(createdUser[0].id, ROLE_USER_ID, trx);
            await trx.commit();
            return createdUser[0];
        } catch (error) {
            await trx.rollback();
            logger.error('[UserService.createOne]', { error: error.message });
            if (error?.code === '23505') {
                throw new DuplicateException('Email is being used');
            }
            throw error;
        }
    }

    async findById(id) {
        const data = Optional.of(await this.repository.findById(id))
            .throwIfNotPresent(new NotFoundException())
            .get();

        return joinUserRoles(data);
    }

    async updateOne(id, updateUserDto) {
        Optional.of(await this.repository.findById(id))
            .throwIfNotPresent(new NotFoundException('User not found'));

        await this.repository.update(id, updateUserDto);
        return this.findById(id);
    }
}

export const UserService = new Service();

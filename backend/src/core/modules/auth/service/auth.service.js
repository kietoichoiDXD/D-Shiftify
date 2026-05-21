import { pick } from 'lodash';
import { JwtPayload } from 'core/modules/auth/dto/jwt-sign.dto';
import { UserDataService } from 'core/modules/user/services/userData.service';
import { joinUserRoles } from 'core/utils/userFilter';
import { BcryptService } from './bcrypt.service';
import { JwtService } from './jwt.service';
import { UserRepository } from '../../user/user.repository';
import { UnAuthorizedException } from '../../../../packages/httpException';

const revokedAccessTokens = new Set();

class Service {
    constructor() {
        this.userRepository = UserRepository;
        this.jwtService = JwtService;
        this.bcryptService = BcryptService;
        this.userDataService = UserDataService;
    }

    async login(loginDto) {
        const user = await this.userRepository.findByEmail(loginDto.email);

        if (!user?.length) {
            throw new UnAuthorizedException('Email or password is incorrect');
        }

        const foundUser = joinUserRoles(user);
        if (this.bcryptService.compare(loginDto.password, foundUser.password)) {
            return {
                user: foundUser,
                ...this.issueTokenPair(foundUser),
            };
        }

        throw new UnAuthorizedException('Email or password is incorrect');
    }

    issueTokenPair(user) {
        const payload = JwtPayload(user);
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.signRefreshToken(payload),
        };
    }

    async refreshToken(refreshTokenDto) {
        let payload;
        try {
            payload = this.jwtService.verifyRefreshToken(refreshTokenDto.refreshToken);
        } catch (error) {
            throw new UnAuthorizedException('Refresh token is invalid or expired');
        }

        const userRows = await this.userRepository.findById(payload.id);
        if (!userRows?.length) {
            throw new UnAuthorizedException('User is no longer available');
        }

        const user = joinUserRoles(userRows);

        return {
            user,
            ...this.issueTokenPair(user),
        };
    }

    logout(accessToken) {
        if (accessToken) {
            revokedAccessTokens.add(accessToken.replace('Bearer ', ''));
        }
        return { loggedOut: true };
    }

    isAccessTokenRevoked(accessToken) {
        if (!accessToken) return false;
        return revokedAccessTokens.has(accessToken.replace('Bearer ', ''));
    }

    #getUserInfo = user => pick(user, ['_id', 'email', 'username', 'roles']);
}

export const AuthService = new Service();

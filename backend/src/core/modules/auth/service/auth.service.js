import { pick } from 'lodash';
import { JwtPayload } from 'core/modules/auth/dto/jwt-sign.dto';
import { NODE_ENV } from 'core/env';
import { UserDataService } from 'core/modules/user/services/userData.service';
import { joinUserRoles } from 'core/utils/userFilter';
import { BcryptService } from './bcrypt.service';
import { JwtService } from './jwt.service';
import { TokenRevocationService } from './token-revocation.service';
import { UserRepository } from '../../user/user.repository';
import { UnAuthorizedException } from '../../../../packages/httpException';

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
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.signRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            access_token: accessToken,
            refresh_token: refreshToken,
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

    async logout(accessToken) {
        const token = accessToken?.replace('Bearer ', '');
        if (token) {
            const payload = this.jwtService.decode(token);
            await TokenRevocationService.revoke(token, payload);
        }
        return { loggedOut: true };
    }

    async forgotPassword({ email }) {
        const userRows = await this.userRepository.findByEmail(email);
        const response = {
            message: 'If this email exists, password reset instructions have been generated',
        };

        if (!userRows?.length) {
            return response;
        }

        const user = joinUserRoles(userRows);
        const resetToken = this.jwtService.signPasswordResetToken({
            id: user.id,
            email: user.email,
        });

        if (NODE_ENV !== 'production') {
            response.resetToken = resetToken;
        }

        return response;
    }

    async resetPassword({ token, password }) {
        let payload;
        try {
            payload = this.jwtService.verifyPasswordResetToken(token);
        } catch (_error) {
            throw new UnAuthorizedException('Password reset token is invalid or expired');
        }

        const userRows = await this.userRepository.findById(payload.id);
        if (!userRows?.length) {
            throw new UnAuthorizedException('User is no longer available');
        }

        await this.userRepository.updatePassword(payload.id, this.bcryptService.hash(password));
        return { passwordReset: true };
    }

    isAccessTokenRevoked(accessToken) {
        return TokenRevocationService.isRevoked(accessToken);
    }

    #getUserInfo = user => pick(user, ['_id', 'email', 'username', 'roles']);
}

export const AuthService = new Service();

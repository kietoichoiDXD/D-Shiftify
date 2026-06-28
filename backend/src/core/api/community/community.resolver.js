import { Module } from 'packages/handler/Module';
import { CommunityController } from './community.controller';

export const CommunityResolver = Module.builder()
    .addPrefix({
        prefixPath: '/community',
        tag: 'community',
        module: 'CommunityModule',
    })
    .register([

        {
            route: '/posts',
            method: 'post',
            controller: CommunityController.createPost,
            preAuthorization: true,
        },
        {
            route: '/posts',
            method: 'get',
            controller: CommunityController.listPosts,
            preAuthorization: true,
        },
        {
            route: '/users/:user_id/posts',
            method: 'get',
            controller: CommunityController.listPostsByUser,
            preAuthorization: true,
        },
        {
            route: '/posts/:post_id',
            method: 'get',
            controller: CommunityController.getPost,
            preAuthorization: true,
        },
        {
            route: '/posts/:post_id',
            method: 'patch',
            controller: CommunityController.updatePost,
            preAuthorization: true,
        },
        {
            route: '/posts/:post_id',
            method: 'delete',
            controller: CommunityController.deletePost,
            preAuthorization: true,
        },

        {
            route: '/posts/:post_id/comments',
            method: 'post',
            controller: CommunityController.createComment,
            preAuthorization: true,
        },
        {
            route: '/posts/:post_id/comments',
            method: 'get',
            controller: CommunityController.listComments,
            preAuthorization: true,
        },
        {
            route: '/comments/:comment_id',
            method: 'get',
            controller: CommunityController.getComment,
            preAuthorization: true,
        },
        {
            route: '/comments/:comment_id',
            method: 'patch',
            controller: CommunityController.updateComment,
            preAuthorization: true,
        },
        {
            route: '/comments/:comment_id',
            method: 'delete',
            controller: CommunityController.deleteComment,
            preAuthorization: true,
        },
    ]);

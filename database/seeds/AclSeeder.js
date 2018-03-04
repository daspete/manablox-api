'use strict'

/*
|--------------------------------------------------------------------------
| AclSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory')

const Role = use('App/Models/Acl/Role')
const Permission = use('App/Models/Acl/Permission')
const PermissionRole = use('App/Models/Acl/PermissionRole')
const RoleUser = use('App/Models/Acl/RoleUser')


class AclSeeder {
    async run(){
        const users = await Factory.model('App/Models/User').create()

        const role = new Role()
        role.role_title = 'Administrator'
        role.role_slug = 'superadmin'
        await role.save()

        const permission = await Permission.createMany([
            {
                permission_title: 'ACL',
                permission_slug: 'acl_view',
                permission_description: 'ACL View'
            },
            {
                permission_title: 'users:view',
                permission_slug: 'users_view',
                permission_description: 'show users'
            },
            {
                permission_title: 'users:create',
                permission_slug: 'users_create',
                permission_description: 'create users'
            },
            {
                permission_title: 'users:edit',
                permission_slug: 'users_edit',
                permission_description: 'edit users'
            },
            {
                permission_title: 'users:delete',
                permission_slug: 'users_delete',
                permission_description: 'delete users'
            }
        ])

        const permission_role = await PermissionRole.createMany([
            {
                permission_id: 1,
                role_id: 1
            },
            {
                permission_id: 2,
                role_id: 1
            },
            {
                permission_id: 3,
                role_id: 1
            },
            {
                permission_id: 4,
                role_id: 1
            },
            {
                permission_id: 5,
                role_id: 1
            },
        ])
        const role_user = new RoleUser()
        role_user.role_id = 1
        role_user.user_id = 1
        await role_user.save()
    }
}

module.exports = AclSeeder

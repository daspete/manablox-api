'use strict'

const Permission = use('App/Models/Acl/Permission')
const Role = use('App/Models/Acl/Role')
const PermissionRole = use('App/Models/Acl/PermissionRole')
const Validator = use('Validator')

class PermissionsRoleController {

    async index({ request, response }){
        const roles = await Role.all()
        const permissions = await Permission.all()

        await response.status(200).send({ roles, permissions })
    }

    async update({ request, response }){
        const permission_role = await PermissionRole.findBy('role_id', request.params.id);

        if(permission_role){
            await permission_role.delete()
        }

        const new_permissions = request.input('new_permissions');
        const new_permission_roles = await PermissionRole.createMany(new_permissions)

        if (new_permission_roles) {
            await response.status(200).send({ success: true })
        } else {
            await response.status(400).send({ error: { message: 'Error while updating permission role' }})
        }
    }

}

module.exports = PermissionsRoleController

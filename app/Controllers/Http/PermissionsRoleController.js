'use strict'

const Permission = use('App/Models/Acl/Permission')
const Role = use('App/Models/Acl/Role')
const PermissionRole = use('App/Models/Acl/PermissionRole')
const Validator = use('Validator')

class PermissionsRoleController {

    async index({ request, response }){

        const roles = await Role.query()
        const permissions = await Permission.query()
        await response.send({
            roles: roles,
            permissions: permissions,
            totalPermissions: permissions.length
        })
    }

    async update({ request, response }){
        const role_id = request.param('id');
        const new_permissions = request.input('new_permissions');

        const permission_role = await PermissionRole.findBy('role_id', role_id);
        if (permission_role) {
            await permission_role.delete()
        }

        const new_permission_roles = await PermissionRole.createMany(new_permissions)
        if (new_permission_roles) {
            var message = {
                title: 'Success',
                text: 'The permissions for this role has been updated successfully',
                type: 'success'
            }
            response.json({ success: true, message: message })
        } else {
            response.json({ success: false, error_message: "Unable to update permissions" })
        }
    }

}

module.exports = PermissionsRoleController

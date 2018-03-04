'use strict'

const Permission = use('App/Models/Acl/Permission')
const PermissionRole = use('App/Models/Acl/PermissionRole')
const Validator = use('Validator')

class PermissionController {

    async index({ request, response }){
        const permissions = await Permission.query()
        await response.send({
            permissions: permissions
        })
    }

    async show({ request, response }) {
        const id = request.params.id
        const permission = await Permission.find(id)

        if (permission) {
            const permissionRoles = await permission.roles().fetch();

            permission.roles = permissionRoles;

            await response.send(permission);
        } else {
            await response.status(404).send({
                error: {
                    message: 'Permission not found'
                }
            });
        }
    }

    async store({ request, response }){
        const permission = new Permission;
        permission.permission_title = request.input("permission_title");
        permission.permission_slug = request.input("permission_slug");
        permission.permission_description = request.input("permission_description");

        var permissionData = request.all();
        var messages = {
            'permission_title.unique': 'Permission already exist',
            'permission_slug.unique': 'Permission Slug already exist'
        }
        const validation = await Validator.validate(permissionData, Permission.rules, messages)
        if (validation.fails()) {
            response.json({ error: { message: validation.messages()[0] }})
        } else {
            await permission.save();

            let permissionRoles = request.input('roles');

            for (let x = 0; x < permissionRoles.length; x++) {
                const permissionRole = new PermissionRole()

                permissionRole.permission_id = permission.id
                permissionRole.role_id = permissionRoles[x].id

                await permissionRole.save();

            }

            var message = {
                title: 'Success',
                text: 'Permission created successfully',
                type: 'success'
            }
            response.json({ success: true, message: message, new_permission: permission })
        }
    }

    async update({ request, response }) {
        const id = request.params.id
        const permissionRoles = request.input('roles')

        const permission = await Permission.find(id)

        if (permission) {
            permission.permission_title = request.input('permission_title');

            var rules = {
                permission_title: `required|unique:permissions,permission_title,id,${permission.id}`
            }

            const validation = await Validator.validate(request.all(), rules);

            if (validation.fails()) {
                await response.status(500).send({
                    error: {
                        message: validation.messages()[0]
                    }
                })
            } else {
                permission.save();

                await PermissionRole
                    .query()
                    .where('permission_id', permission.id)
                    .delete()

                let permissionRoles = request.input('roles');

                for (let x = 0; x < permissionRoles.length; x++) {
                    const permissionRole = new PermissionRole()

                    permissionRole.permission_id = permission.id
                    permissionRole.role_id = permissionRoles[x].id

                    await permissionRole.save();

                }
            }




        } else {
            await response.status(404).send({
                message: 'Role not found'
            })
        }
    }

    async destroy({ request, response }){
        const id = request.params.id
        const permission = await Permission.find(id)
        if (permission) {
            try {
                await permission.delete()
                response.json({ success: true, message: 'Permission has been deleted' });
            } catch (e) {
                response.json({ success: false, message: 'Error, deleting the permission', error: e });
            }
        } else {
            response.json({ success: false, message: 'Unable to find permission to delete' });
        }

        response.send(request.params);
    }

}

module.exports = PermissionController

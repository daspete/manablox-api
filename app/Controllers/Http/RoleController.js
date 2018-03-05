'use strict'

const Role = use('App/Models/Acl/Role')
const PermissionRole = use('App/Models/Acl/PermissionRole')
const Validator = use('Validator')

class RoleController {

    async index({ request, response }) {
        const roles = await Role.query()
        await response.send({
            roles: roles,
        })
    }

    async show({ request, response }){
        const id = request.params.id
        const role = await Role.find(id)

        if(role){
            const rolePermissions = await role.permissions().fetch();

            role.permissions = rolePermissions;

            await response.send(role);
        }else{
            await response.status(404).send({
                error: {
                    message: 'Role not found'
                }
            });
        }
    }

    async update({ request, response }){
        const id = request.params.id
        const rolePermissions = request.input('permissions')

        const role = await Role.find(id)

        if(role){
            role.role_title = request.input('role_title');

            var rules = {
                role_title: `required|unique:roles,role_title,id,${role.id}`
            }

            const validation = await Validator.validate(request.all(), rules);

            if (validation.fails()){
                await response.status(500).send({
                    error: {
                        message: validation.messages()[0]
                    }
                })
            }else{
                role.save();

                await PermissionRole
                    .query()
                    .where('role_id', role.id)
                    .delete()

                for(let x = 0; x < rolePermissions.length; x++){
                    const permissionRole = new PermissionRole()

                    permissionRole.permission_id = rolePermissions[x].id
                    permissionRole.role_id = role.id

                    await permissionRole.save();

                }
            }




        }else{
            await response.status(404).send({
                message: 'Role not found'
            })
        }
    }

    async store({ request, response }) {
        const role = new Role;
        role.role_title = request.input("role_title");
        role.role_slug = request.input("role_slug");

        var roleData = request.all();
        var messages = {
            'role_title.unique': 'Role already exist',
            'role_slug.unique': 'Role Slug already exist'
        }
        const validation = await Validator.validate(roleData, Role.rules, messages)
        if (validation.fails()) {
            response.json({ success: false, error_message: validation.messages()[0] })
        } else {
            await role.save();

            let rolePermissions = request.input('permissions');

            for (let x = 0; x < rolePermissions.length; x++) {
                const permissionRole = new PermissionRole()

                permissionRole.permission_id = rolePermissions[x].id
                permissionRole.role_id = role.id

                await permissionRole.save();

            }
            var message = {
                title: 'Success',
                text: 'Role created successfully',
                type: 'success'
            }
            response.json({ success: true, message: message, new_role: role })
        }
    }

    async destroy({ request, response }) {
        const id = request.params.id
        const role = await Role.find(id);
        if (role) {
            try {
                await role.delete()
                response.json({ success: true, message: 'Role has been deleted' });
            } catch (e) {
                response.json({ success: false, message: 'Error, deleting the role', error: e });
            }
        } else {
            response.json({ success: false, message: 'Unable to find role to delete' });
        }

        response.send(request.params());
    }


}

module.exports = RoleController

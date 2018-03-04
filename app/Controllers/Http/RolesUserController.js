'use strict'

const Role = use('App/Models/Acl/Role')
const RoleUser = use('App/Models/Acl/RoleUser')
const User = use('App/Models/User')

const Validator = use('Validator')


class RolesUserController {

    async index({ request, response }){
        const users_roles = await RoleUser.query()
            .innerJoin('users', 'users.id', 'role_user.user_id')
            .innerJoin('roles', 'roles.id', 'role_user.role_id').
            select('user_id', 'role_id', 'role_user.id AS role_user_id', 'username', 'email', 'role_title')

        await response.send({
            users_roles: users_roles,
            users: await User.all(),
            roles: await Role.all()
        })
    }

    async store({ request, response }){
        const role_user_exist = await RoleUser.query()
            .where('user_id', '=', request.input("user_id"))
            .where('role_id', '=', request.input("role_id"))

        if ((role_user_exist).length <= 0) {
            const role_user = new RoleUser;
            role_user.user_id = request.input("user_id");
            role_user.role_id = request.input("role_id");
            var role_userData = request.all();
            const validation = await Validator.validate(role_userData, RoleUser.rules)
            if (validation.fails()) {
                response.json({ success: false, error_message: validation.messages()[0] })
            } else {
                await role_user.save();
                var message = {
                    title: 'Success',
                    text: 'User Role created successfully',
                    type: 'success'
                }
                response.json({ success: true, message: message, new_user_role: role_user })
            }
        } else {
            var message = {
                message: "This user already has this role"
            }
            response.json({ success: false, error_message: message })
        }
    }

    async destroy({ request, response }){
        const id = request.param('id')
        const user_role = await RoleUser.find(id);

        if(user_role){
            try {
                await user_role.delete()
                response.json({ success: true, message: 'User Role has been deleted' });
            } catch (e) {
                response.json({ success: false, message: 'Error, deleting the user role', error: e });
            }
        } else {
            response.json({ success: false, message: 'Unable to find user role to delete' });
        }

        response.send(request.params());
    }

}

module.exports = RolesUserController

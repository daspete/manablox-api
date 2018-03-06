'use strict'

const Role = use('App/Models/Acl/Role')
const RoleUser = use('App/Models/Acl/RoleUser')
const User = use('App/Models/User')

const Validator = use('Validator')


class RolesUserController {

    async index({ request, response }){
        const users_roles = await RoleUser.query()
            .innerJoin('users', 'users.id', 'role_user.user_id')
            .innerJoin('roles', 'roles.id', 'role_user.role_id')
            .select('user_id', 'role_id', 'role_user.id AS role_user_id', 'username', 'email', 'role_title')

        await response.send({
            users_roles: users_roles,
            users: await User.all(),
            roles: await Role.all()
        })
    }

    async store({ request, response }){
        const validation = await Validator.validate(request.all(), RoleUser.rules)

        if(validation.fails()){
            await response.status(400).send({ error: { message: validation.messages()[0] }})
            return;
        }

        const role_user = await RoleUser.query()
            .where('user_id', '=', request.input('user_id'))
            .where('role_id', '=', request.input('role_id'))

        if(role_user.getCount() == 0){
            const role_user = new RoleUser;
            role_user.user_id = request.input('user_id')
            role_user.role_id = request.input('role_id')
            await response.status(201).send({ success: true })
        }else{
            await response.status(400).send({ error: { message: 'User already applied to this role' }})
        }
    }

    async destroy({ request, response }){
        const user_role = await RoleUser.find(request.params.id);

        if(user_role){
            try{
                await user_role.delete()

                await response.status(200).send({ success: true })
            }catch(e){
                await response.status(500).send({ error: { message: 'Error while deleting the user role' }})
            }
        } else {
            await response.status(404).send({ error: { message: 'User role not found' }});
        }
    }

}

module.exports = RolesUserController

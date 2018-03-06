'use strict'

const User = use('App/Models/User')
const RoleUser = use('App/Models/Acl/RoleUser')
const Hash = use('Hash')
const Validator = use('Validator')

class UsersController {
    async index({ request, response }){
        const users = await User.all();

        await response.send(users);
    }

    async create({ request, response }){

    }

    async store({ request, response }){
        const validation = await Validator.validate(request.all(), User.rules)

        if(validation.fails()){
            await response.status(400).send({ error: { message: validation.messages()[0] }})
            return;
        }

        const user = new User;
        user.username = request.input("username")
        user.email = request.input("email")
        user.password = request.input('password')
        await user.save()

        await response.status(201).send({ success: true })
    }

    async show({ request, response }){
        const user = await User.find(request.params.id)

        if(user){
            user.roles = await user.roles().fetch()

            await response.status(200).send(user)
        } else {
            await response.status(404).send({ error: { message: 'User not found' }});
        }
    }

    // async edit({ request, response }){
    //     const id = request.params.id
    //     const user = await User.find(id)

    //     if(user){
    //         await response.send({
    //             user: user,
    //         })
    //     }else{
    //         var message = {
    //             title: 'Atention!',
    //             text: 'Unable to find user to edit',
    //             type: 'warning'
    //         }
    //         //await request.with({ message: message }).flash()
    //         await response.status(201).send({ message });
    //         //response.redirect('/users')
    //     }
    // }

    async update({ request, response }){
        let id = request.params.id;

        const validation = await Validator.validate(request.all(), {
            username: `required|unique:users,username,id,${id}`,
            email: `required|unique:users,email,id,${id}`,
        })

        if(validation.fails()){
            await response.status(400).send({ error: { message: validation.messages()[0] }})
            return;
        }

        const user = await User.find(id)

        if(user){
            user.username = request.input("username");
            user.email = request.input('email');
            user.gender = request.input('gender');
            user.first_name = request.input('first_name');
            user.last_name = request.input('last_name');
            if(request.input('password'))
                user.password = await Hash.make(request.input('password'))
            await user.save();

            const userRoles = request.input('roles');

            await RoleUser
                .query()
                .where('user_id', user.id)
                .delete()

            for (let x = 0; x < userRoles.length; x++) {
                const role_user = new RoleUser()
                role_user.role_id = userRoles[x].id
                role_user.user_id = user.id
                await role_user.save()
            }

            await response.status(200).send({ success: true })
        }else{
            await response.status(404).send({ error: { message: 'User not found' }})
        }
    }

    async destroy({ request, response }){
        const user = await User.find(request.params.id)
        if(user){
            try{
                await user.delete()

                await response.status(200).send({ success: true })
            }catch(e){
                await response.status(500).send({ error: { message: 'Error while deleting the user' }})
            }
        }else{
            await response.status(404).send({ error: { message: 'User not found' }})
        }
    }
}

module.exports = UsersController

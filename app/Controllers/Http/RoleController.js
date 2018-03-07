'use strict'

const Role = use('App/Models/Acl/Role')
const PermissionRole = use('App/Models/Acl/PermissionRole')
const Validator = use('Validator')

class RoleController {

    async index({ request, response }) {
        const roles = await Role.query()
        await response.send({ roles })
    }

    async show({ request, response }){
        const role = await Role.find(request.params.id)

        if(role){
            const rolePermissions = await role.permissions().fetch()
            role.permissions = rolePermissions

            await response.status(200).send(role)
        }else{
            await response.status(404).send({ error: { message: 'Role not found' }})
        }
    }

    async store({ request, response }){
        const validation = await Validator.validate(request.all(), Role.rules, {
            'role_title.unique': 'Role title already exists',
            'role_slug.unique': 'Role slug already exists'
        })

        // if validation fails, give us the errors
        if(validation.fails()){
            await response.status(400).send({ error: { message: validation.messages()[0] }})
            return
        }

        const role = new Role()
        role.role_title = request.input('role_title')
        role.role_slug = request.input('role_slug')
        await role.save()

        let rolePermissions = request.input('permissions')
        for(let x = 0; x < rolePermissions.length; x++){
            const permissionRole = new PermissionRole()
            permissionRole.permission_id = rolePermissions[x].id
            permissionRole.role_id = role.id
            await permissionRole.save()
        }

        await response.status(201).send({ success: true })
    }

    async update({ request, response }){
        const id = request.params.id

        const validation = await Validator.validate(request.all(), {
            role_title: `required|unique:roles,role_title,id,${id}`
        }, {
            'role_title.unique': 'Role title already exists',
            'role_title.required': 'Role title is required'
        })

        if(validation.fails()){
            await response.status(400).send({ error: { message: validation.messages()[0] }})
            return
        }

        const role = await Role.find(id)

        if(role){
            role.role_title = request.input('role_title')
            await role.save()

            await PermissionRole
                .query()
                .where('role_id', role.id)
                .delete()

            let rolePermissions = request.input('permissions')
            for(let x = 0; x < rolePermissions.length; x++){
                const permissionRole = new PermissionRole()
                permissionRole.permission_id = rolePermissions[x].id
                permissionRole.role_id = role.id
                await permissionRole.save()
            }

            await response.status(200).send({ success: true })
        }else{
            await response.status(404).send({ error: { message: 'Role not found' }})
        }
    }

    async destroy({ request, response }){
        const role = await Role.find(request.params.id)
        if(role){
            try{
                await role.delete()
                await response.status(200).send({ success: true })
            }catch(e){
                await response.status(500).send({ error: { message: 'Error while deleting the role' }})
            }
        }else{
            await response.status(404).send({ error: { message: 'Role not found' }})
        }
    }


}

module.exports = RoleController

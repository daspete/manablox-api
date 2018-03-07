'use strict'

const Permission = use('App/Models/Acl/Permission')
const PermissionRole = use('App/Models/Acl/PermissionRole')
const Validator = use('Validator')

class PermissionController {

    async index({ request, response }){
        const permissions = await Permission.all()
        await response.send({ permissions })
    }

    async show({ request, response }) {
        // get the requested permission id
        const permission = await Permission.find(request.params.id)

        // send the permission, when we got it, otherwise send an error
        if(permission){
            permission.roles = await permission.roles().fetch()
            await response.send(permission)
        }else{
            await response.status(404).send({ error: { message: 'Permission not found' }})
        }
    }

    async store({ request, response }){
        // validate the input
        const validation = await Validator.validate(request.all(), Permission.rules, {
            'permission_title.unique': 'Permission title already exists',
            'permission_slug.unique': 'Permission slug already exists'
        })

        // if validation fails, give us the errors
        if(validation.fails()){
            await response.status(400).send({ error: { message: validation.messages()[0] }})
            return
        }

        // create the new permission
        const permission = new Permission()
        permission.permission_title = request.input("permission_title")
        permission.permission_slug = request.input("permission_slug")
        permission.permission_description = request.input("permission_description")
        await permission.save()

        // check if we got some roles for our new permission and if, just save the relations
        let permissionRoles = request.input('roles')
        for(let x = 0; x < permissionRoles.length; x++){
            const permissionRole = new PermissionRole()
            permissionRole.permission_id = permission.id
            permissionRole.role_id = permissionRoles[x].id
            await permissionRole.save()
        }

        await response.status(201).send({ success: true })
    }

    async update({ request, response }) {
        // validate the input
        const validation = await Validator.validate(request.all(), {
            permission_title: `required|unique:permissions,permission_title,id,${request.params.id}`
        }, {
            'permission_title.unique': 'Permission title already exists',
            'permission_title.required': 'Permission title is required'
        })

        // if validation fails, give us the errors
        if(validation.fails()){
            await response.status(400).send({ error: { message: validation.messages()[0] }})
            return
        }

        // get the permission to edit, if we haven't got it, return an error
        const permission = await Permission.find(request.params.id)
        if(permission){
            permission.permission_title = request.input('permission_title')
            await permission.save()

            // delete all permission roles before inserting the updated ones
            await PermissionRole
                .query()
                .where('permission_id', permission.id)
                .delete()

            let permissionRoles = request.input('roles')
            for (let x = 0; x < permissionRoles.length; x++) {
                const permissionRole = new PermissionRole()
                permissionRole.permission_id = permission.id
                permissionRole.role_id = permissionRoles[x].id
                await permissionRole.save()
            }

            await response.status(200).send({ success: true })
        }else{
            await response.status(404).send({ error: { message: 'Permission not found' }})
        }
    }

    async destroy({ request, response }){
        const permission = await Permission.find(request.params.id)
        if(permission){
            try{
                await permission.delete()

                await response.status(200).send({ success: true })
            }catch(e){
                await response.status(500).send({ error: { message: 'Error while deleting the permission' }})
            }
        } else {
            await response.status(404).send({ error: { message: 'Permission not found' }})
        }
    }

}

module.exports = PermissionController

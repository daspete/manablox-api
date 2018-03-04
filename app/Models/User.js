'use strict'

const Model = use('Model')
const moment = use('moment')

class User extends Model {
    static boot(){
        super.boot()

        /**
         * A hook to hash the user password before saving
         * it to the database.
         *
         * Look at `app/Models/Hooks/User.js` file to
         * check the hashPassword method
         */
        this.addHook('beforeCreate', 'User.hashPassword')
    }

    static get hidden(){
        return ['password', 'remember_token']
    }

    static get rules(){
        return {
            username: 'required|unique:users',
            email: 'required|email|unique:users',
            password: 'required'
        }
    }

    static get dateFormat(){
        return 'DD.MM.YYYY HH:mm:ss'
    }


    getCreatedAt(){
        return moment(this.created_at).format('DD.MM.YYYY HH:mm')
    }

    getUpdatedAt(){
        return moment(this.updated_at).format('DD.MM.YYYY HH:mm')
    }

    /**
     * A relationship on tokens is required for auth to
     * work. Since features like `refreshTokens` or
     * `rememberToken` will be saved inside the
     * tokens table.
     *
     * @method tokens
     *
     * @return {Object}
     */
    tokens(){
        return this.hasMany('App/Models/Token')
    }


    /*
    |--------------------------------------------------------------------------
    | ACL Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Checks a Permission
     *
     * @param  String permission Slug of a permission (i.e: manage_user)
     * @return Boolean true if has permission, otherwise false
     */
    async can(permission){
        if(permission == null) return false;

        if(Array.isArray(permission)){
            for(let i = 0; i < permission.length; i++){
                let can = await this.checkPermission(permission[i])
                if(can == false) return false
            }
        }else{
            return await this.checkPermission(permission);
        }

        return true;
    }

    /**
     * Check if the permission matches with any permission user has
     *
     * @param  String permission slug of a permission
     * @return Boolean true if permission exists, otherwise false
     */
    async checkPermission(perm){
        return (await this.roles()
            .innerJoin('role_user', 'roles.id', 'role_user.role_id')
            .innerJoin('permission_role', 'roles.id', 'permission_role.role_id')
            .innerJoin('permissions', 'permission_role.permission_id', 'permissions.id')
            .where('user_id', '=', this.id)
            .where('permission_slug', '=', perm.toLowerCase())).length
    }

    /*
    |--------------------------------------------------------------------------
    | Relationship Methods
    |--------------------------------------------------------------------------
    */
    /**
    * Many-To-Many Relationship Method for accessing the User.roles
    *
    * @return Object
    */
    roles(){
        return this.belongsToMany('App/Models/Acl/Role')
    }
}

module.exports = User

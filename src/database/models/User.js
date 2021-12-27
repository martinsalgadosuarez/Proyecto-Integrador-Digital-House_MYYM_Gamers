module.exports = function (sequelize, dataTypes) {

    let alias = "User";

    let cols = {
        id: {
            type: dataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        user: {
            type: dataTypes.STRING(8),
            allowNull: false
        },
        name: {
            type: dataTypes.STRING(16)
        },
        lastName: {
            type: dataTypes.STRING(25)
        },
        telephone: {
            type: dataTypes.INTEGER(11).UNSIGNED
        },
        email: {
            type: dataTypes.STRING(100),
            allowNull: false
        },
        password: {
            type: dataTypes.STRING(100),
            allowNull: false
        },
        avatar: {
            type: dataTypes.STRING(200),
            allowNull: false
        },
        rolesId: {
            type: dataTypes.TINYINT(4),
            allowNull: false
        },
        addressesId: {
            type: dataTypes.INTEGER(11).UNSIGNED

        }


    }

    let config = {
        tableName: "users",
        timestamps: true

    }

    const User = sequelize.define(alias, cols, config)
   
    User.associate = models => {
       
        User.belongsTo(models.Role, {
            as: "Role",
            foreignKey:"rolesId" 
        }),
        User.hasMany(models.Cart, {
            as: "Cart",
            foreignKey: "userId"
        }), 
        User.belongsTo(models.Addresse, {
            as: "Addresse",
            foreignKey:"addressesId" 
        }),
        User.hasMany(models.Favorite, {
            as: "Favorite",
            foreignKey: "userId" 
        }),
        User.hasMany(models.Creditcard, {
            as: "Creditcard",
            foreignKey: "userId" 
        }), 
       User.hasOne(models.Valorationproduct, {
            as: "Valorationproduct",
            foreignKey:"userId"  
        })


    }



  
    return User

}
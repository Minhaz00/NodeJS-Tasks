
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('student', {
    student_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    student_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gpa: {
      type: DataTypes.DECIMAL(3, 2),
    },
  }, {
    timestamps: false,
  });

  return Student;
};

module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define('grade', {
    grade_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    course_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grade: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      validate: {
        min: 0,
        max: 4,
      },
    },
  }, {
    timestamps: false,
  });

  return Grade;
};

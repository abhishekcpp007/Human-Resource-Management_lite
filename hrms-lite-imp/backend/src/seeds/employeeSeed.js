const Employee = require('../models/Employee');

const employees = [
    {
        employeeId: 'EMP001',
        fullName: 'Rahul Sharma',
        email: 'rahul.sharma@hrms.com',
        phone: '9876543210',
        department: 'Engineering',
        designation: 'Senior Developer',
        joiningDate: '2023-01-15',
        salary: 85000
    },
    {
        employeeId: 'EMP002',
        fullName: 'Priya Patel',
        email: 'priya.patel@hrms.com',
        phone: '9876543211',
        department: 'Engineering',
        designation: 'Frontend Developer',
        joiningDate: '2023-03-20',
        salary: 65000
    },
    {
        employeeId: 'EMP003',
        fullName: 'Amit Kumar',
        email: 'amit.kumar@hrms.com',
        phone: '9876543212',
        department: 'Human Resources',
        designation: 'HR Manager',
        joiningDate: '2022-06-10',
        salary: 75000
    },
    {
        employeeId: 'EMP004',
        fullName: 'Sneha Reddy',
        email: 'sneha.reddy@hrms.com',
        phone: '9876543213',
        department: 'Marketing',
        designation: 'Marketing Lead',
        joiningDate: '2023-02-01',
        salary: 70000
    },
    {
        employeeId: 'EMP005',
        fullName: 'Vikram Singh',
        email: 'vikram.singh@hrms.com',
        phone: '9876543214',
        department: 'Engineering',
        designation: 'Backend Developer',
        joiningDate: '2023-04-15',
        salary: 72000
    },
    {
        employeeId: 'EMP006',
        fullName: 'Anjali Gupta',
        email: 'anjali.gupta@hrms.com',
        phone: '9876543215',
        department: 'Finance',
        designation: 'Accountant',
        joiningDate: '2022-09-01',
        salary: 55000
    },
    {
        employeeId: 'EMP007',
        fullName: 'James Taylor',
        email: 'james.taylor@hrms.com',
        phone: '9876543216',
        department: 'Engineering',
        designation: 'DevOps Engineer',
        joiningDate: '2023-05-10',
        salary: 80000
    },
    {
        employeeId: 'EMP008',
        fullName: 'Neha Joshi',
        email: 'neha.joshi@hrms.com',
        phone: '9876543217',
        department: 'Human Resources',
        designation: 'HR Executive',
        joiningDate: '2023-07-20',
        salary: 45000
    },
    {
        employeeId: 'EMP009',
        fullName: 'Ravi Verma',
        email: 'ravi.verma@hrms.com',
        phone: '9876543218',
        department: 'Sales',
        designation: 'Sales Manager',
        joiningDate: '2022-11-15',
        salary: 78000
    },
    {
        employeeId: 'EMP010',
        fullName: 'Kavitha Nair',
        email: 'kavitha.nair@hrms.com',
        phone: '9876543219',
        department: 'Engineering',
        designation: 'QA Engineer',
        joiningDate: '2023-06-01',
        salary: 58000
    },
    {
        employeeId: 'EMP011',
        fullName: 'Arjun Mehta',
        email: 'arjun.mehta@hrms.com',
        phone: '9876543220',
        department: 'Marketing',
        designation: 'Content Writer',
        joiningDate: '2023-08-10',
        salary: 42000
    },
    {
        employeeId: 'EMP012',
        fullName: 'Deepika Rao',
        email: 'deepika.rao@hrms.com',
        phone: '9876543221',
        department: 'Finance',
        designation: 'Finance Manager',
        joiningDate: '2022-04-01',
        salary: 90000
    },
    {
        employeeId: 'EMP013',
        fullName: 'Suresh Iyer',
        email: 'suresh.iyer@hrms.com',
        phone: '9876543222',
        department: 'Engineering',
        designation: 'Tech Lead',
        joiningDate: '2021-12-01',
        salary: 120000
    },
    {
        employeeId: 'EMP014',
        fullName: 'Pooja Desai',
        email: 'pooja.desai@hrms.com',
        phone: '9876543223',
        department: 'Sales',
        designation: 'Sales Executive',
        joiningDate: '2023-09-15',
        salary: 40000
    },
    {
        employeeId: 'EMP015',
        fullName: 'Karan Malhotra',
        email: 'karan.malhotra@hrms.com',
        phone: '9876543224',
        department: 'Engineering',
        designation: 'Full Stack Developer',
        joiningDate: '2023-10-01',
        salary: 75000
    }
];

const seedEmployees = async () => {
    try {
        // Clear existing employees (except soft-deleted ones)
        await Employee.destroy({ where: {}, force: true });

        // Insert new employees
        const created = await Employee.bulkCreate(employees);
        console.log(`✓ Created ${created.length} employees`);
        return created;
    } catch (error) {
        console.error('Error seeding employees:', error);
        throw error;
    }
};

module.exports = { seedEmployees, employees };



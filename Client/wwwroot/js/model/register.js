class RegisterEmployee extends Employee {
    constructor(nik, firstName, lastName, phone, birthDate, gender, email, managerId, password, fullName) {
        super(nik, firstName, lastName, phone, birthDate, gender, email, managerId);
        this.password = password;
        this.fullName = fullName;
    }
}


using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tb_m_accounts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false),
                    password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    otp = table.Column<int>(type: "int", nullable: false),
                    expired_token = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_used = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_m_accounts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tb_m_projectlists",
                columns: table => new
                {
                    id = table.Column<string>(type: "nchar(5)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    manager_id = table.Column<int>(type: "int", nullable: false),
                    employee_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_m_projectlists", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tb_m_roles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_m_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tb_m_employees",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false),
                    first_name = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    last_name = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    gender = table.Column<int>(type: "int", nullable: false),
                    email = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    phone_number = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    birth_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    image = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    manager_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_m_employees", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_m_employees_tb_m_accounts_id",
                        column: x => x.id,
                        principalTable: "tb_m_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tb_m_employees_tb_m_employees_manager_id",
                        column: x => x.manager_id,
                        principalTable: "tb_m_employees",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "tb_m_reports",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    progress_report = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    done_by = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    project_id = table.Column<string>(type: "nchar(5)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_m_reports", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_m_reports_tb_m_projectlists_project_id",
                        column: x => x.project_id,
                        principalTable: "tb_m_projectlists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tb_r_accountroles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    account_id = table.Column<int>(type: "int", nullable: false),
                    role_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_r_accountroles", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_r_accountroles_tb_m_accounts_account_id",
                        column: x => x.account_id,
                        principalTable: "tb_m_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tb_r_accountroles_tb_m_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "tb_m_roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tb_r_employeeprojectlists",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    projectlist_id = table.Column<string>(type: "nchar(5)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_r_employeeprojectlists", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_r_employeeprojectlists_tb_m_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "tb_m_employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tb_r_employeeprojectlists_tb_m_projectlists_projectlist_id",
                        column: x => x.projectlist_id,
                        principalTable: "tb_m_projectlists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tb_m_employees_email",
                table: "tb_m_employees",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_m_employees_manager_id",
                table: "tb_m_employees",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_tb_m_employees_phone_number",
                table: "tb_m_employees",
                column: "phone_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_m_reports_project_id",
                table: "tb_m_reports",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_tb_r_accountroles_account_id",
                table: "tb_r_accountroles",
                column: "account_id");

            migrationBuilder.CreateIndex(
                name: "IX_tb_r_accountroles_role_id",
                table: "tb_r_accountroles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_tb_r_employeeprojectlists_employee_id",
                table: "tb_r_employeeprojectlists",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_tb_r_employeeprojectlists_projectlist_id",
                table: "tb_r_employeeprojectlists",
                column: "projectlist_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tb_m_reports");

            migrationBuilder.DropTable(
                name: "tb_r_accountroles");

            migrationBuilder.DropTable(
                name: "tb_r_employeeprojectlists");

            migrationBuilder.DropTable(
                name: "tb_m_roles");

            migrationBuilder.DropTable(
                name: "tb_m_employees");

            migrationBuilder.DropTable(
                name: "tb_m_projectlists");

            migrationBuilder.DropTable(
                name: "tb_m_accounts");
        }
    }
}

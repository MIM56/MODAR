using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReportProgressReportLength : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tb_m_reports_tb_m_projectlists_project_id",
                table: "tb_m_reports");

            migrationBuilder.DropIndex(
                name: "IX_tb_m_reports_project_id",
                table: "tb_m_reports");

            migrationBuilder.AlterColumn<string>(
                name: "title",
                table: "tb_m_reports",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "project_id",
                table: "tb_m_reports",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nchar(5)");

            migrationBuilder.AlterColumn<string>(
                name: "progress_report",
                table: "tb_m_reports",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "done_by",
                table: "tb_m_reports",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "tb_m_reports",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "tb_m_reports",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProjectListId",
                table: "tb_m_reports",
                type: "nchar(5)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_m_reports_EmployeeId",
                table: "tb_m_reports",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_m_reports_ProjectListId",
                table: "tb_m_reports",
                column: "ProjectListId");

            migrationBuilder.AddForeignKey(
                name: "FK_tb_m_reports_tb_m_employees_EmployeeId",
                table: "tb_m_reports",
                column: "EmployeeId",
                principalTable: "tb_m_employees",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_tb_m_reports_tb_m_projectlists_ProjectListId",
                table: "tb_m_reports",
                column: "ProjectListId",
                principalTable: "tb_m_projectlists",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tb_m_reports_tb_m_employees_EmployeeId",
                table: "tb_m_reports");

            migrationBuilder.DropForeignKey(
                name: "FK_tb_m_reports_tb_m_projectlists_ProjectListId",
                table: "tb_m_reports");

            migrationBuilder.DropIndex(
                name: "IX_tb_m_reports_EmployeeId",
                table: "tb_m_reports");

            migrationBuilder.DropIndex(
                name: "IX_tb_m_reports_ProjectListId",
                table: "tb_m_reports");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "tb_m_reports");

            migrationBuilder.DropColumn(
                name: "ProjectListId",
                table: "tb_m_reports");

            migrationBuilder.AlterColumn<string>(
                name: "title",
                table: "tb_m_reports",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "project_id",
                table: "tb_m_reports",
                type: "nchar(5)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "progress_report",
                table: "tb_m_reports",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<string>(
                name: "done_by",
                table: "tb_m_reports",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "tb_m_reports",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_m_reports_project_id",
                table: "tb_m_reports",
                column: "project_id");

            migrationBuilder.AddForeignKey(
                name: "FK_tb_m_reports_tb_m_projectlists_project_id",
                table: "tb_m_reports",
                column: "project_id",
                principalTable: "tb_m_projectlists",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

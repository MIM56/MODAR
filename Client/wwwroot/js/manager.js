// Get all project list

$(document).ready(function () {
    let table = $("#tableProjects").DataTable({
        ajax: {
            url: "https://localhost:7261/api/projectlists/masterprojectlist",
            dataType: "Json",
            dataSrc: "data"
        },
        columns: [
            {
                "data": null, "sortable": false,
                render: function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            {
                "data": "id"
            },
            {
                "data": "name"
            },
            {
                "data": "status", 
                render: function (data, type, row) {
                    if (row.status == 0) {
                        return `<span class="badge rounded-pill bg-danger"
                                rel="tooltip"
                                data-bs-placement="top"
                                title="Pending"
                                >Pending</span>`
                    } else if (row.status == 1) {
                        return `<span class="badge rounded-pill bg-warning"
                                rel="tooltip"
                                data-bs-placement="top"
                                title="On Progress"
                                >On Progress</span>`
                    } else {
                        return `<span class="badge rounded-pill bg-success"
                                rel="tooltip"
                                data-bs-placement="top"
                                title="On Progress"
                                >Complete</span>`
                    }
                }
            },
            {
                "data": "startDate",
                render: DataTable.render.date()
            },
            {
                "data": "endDate",
                render: DataTable.render.date()
            },
            {
                "data": "manager"
            },
            {
                "data": "employee"
            },
            {
                "data": "description"
            },
            {
                render: function (data, type, row) {
                    return `<button
                            class="btn btn-warning"
                            data-bs-toggle="modal"
                            data-bs-target="#modalUI"
                            onclick="modalUpdate('${row.id}')"
                            rel="tooltip"
                            data-bs-placement="top"
                            title="Update Button"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn btn-danger"
                            id="Delete"
                            rel="tooltip"
                            data-bs-placement="top"
                            title="Delete Button"><i class="far fa-trash-alt"></i></button>`
                }
            },
        ],
        dom: '<"top"Blf>rtip',
        buttons: [
            {
                extend: 'copyHtml5',
                text: '<i class="fa fa-files-o"></i> Copy',
                titleAttr: 'Copy',
                className: 'btn btn-warning btn-xs',
            },
            {
                extend: 'excelHtml5',
                text: '<i class="fa fa-files-o"></i> Excel',
                titleAttr: 'Excel',
                className: 'btn btn-success btn-xs',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7]
                }
            },
            {
                extend: 'csvHtml5',
                text: '<i class="fa fa-files-o"></i> CSV',
                titleAttr: 'CSV',
                className: 'btn btn-dark btn-xs',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7]
                }
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="fa fa-file-pdf-o"></i> PDF',
                titleAttr: 'PDF',
                className: 'btn btn-danger btn-xs',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7]
                }
            },
            {
                extend: 'colvis',
                className: 'btn btn-default btn-xs',
            }
        ]
    });

    $.ajax({
        url: "https://localhost:7261/api/reports",
        type: "GET",
        dataType: "Json",
        typeof: "data"
    }).done((result) => {
        for (let i = 0; i < result.data.length; i++) {
            var reportCount = i + 1;
        }
        console.log(result);
        $('.numbers').find('#report').text(reportCount);
    }).fail((error) => {
        console.log("error");
    });


    $.ajax({
        url: "https://localhost:7261/api/projectlists",
        type: "GET",
        dataType: "Json",
        typeof: "data"
    }).done((result) => {
        for (let i = 0; i < result.data.length; i++) {
            var plCount = i + 1;
        }
        console.log(result);
        $('.numbers').find('#prj').text(plCount);
    }).fail((error) => {
        console.log("error");
    });

    let pending = 0;
    let progress = 0;
    let complete = 0;

    $.ajax({
        url: 'https://localhost:7261/api/reports',
    }).done((result) => {
        for (var i = 0; i < result.data.length; i++) {
            if (result.data[i].status == 0) {
                pending += 1;
            } else if (result.data[i].status == 1) {
                progress += 1;
            } else if (result.data[i].status == 2) {
                complete += 1;
            }
        }

        $.ajax({
            url: "https://localhost:7261/api/projectlists",
            success: function (data) {
                var options = {
                    series: [{
                        data: [pending, progress, complete]
                    }],
                    chart: {
                        type: 'bar',
                        height: 280,
                        offsetY: 16,
                    },
                    plotOptions: {
                        bar: {
                            distributed: true,
                            borderRadius: 4,
                            horizontal: true,
                        },
                    },
                    colors: ["#FF69B4", "#FF7F50", "#87D4F9"],
                    dataLabels: {
                        enabled: false
                    },
                    xaxis: {
                        categories: ['Pending', 'On Progress', 'Complete'
                        ],
                    }
                };

                var chart = new ApexCharts(document.querySelector("#chart"), options);
                chart.render();


                console.log('pending', pending);
                for (var i = 0; i < data.data.length; i++) {
                    var pendingVal = i + 1;
                }
                let pendingRad = parseInt((pending / pendingVal) * 100);
                console.log('pdg=', pendingRad);

                var x = {
                    chart: {
                        height: 280,
                        type: "radialBar",
                    },
                    series: [pendingRad],
                    colors: ["#20E647"],
                    plotOptions: {
                        radialBar: {
                            hollow: {
                                margin: 0,
                                size: "70%",
                                background: "#293450"
                            },
                            track: {
                                dropShadow: {
                                    enabled: true,
                                    top: 2,
                                    left: 0,
                                    blur: 4,
                                    opacity: 0.15
                                }
                            },
                            dataLabels: {
                                name: {
                                    offsetY: -10,
                                    color: "#fff",
                                    fontSize: "13px"
                                },
                                value: {
                                    color: "#fff",
                                    fontSize: "30px",
                                    show: true
                                }
                            }
                        }
                    },
                    fill: {
                        type: "gradient",
                        gradient: {
                            shade: "dark",
                            type: "horizontal",
                            gradientToColors: ["hotpink"],
                            stops: [0, 100]
                        }
                    },
                    stroke: {
                        lineCap: "round"
                    },
                    labels: ["Progress"]
                };

                var chart = new ApexCharts(document.querySelector("#pending"), x);
                chart.render();

                for (var i = 0; i < data.data.length; i++) {
                    var progressVal = i+1;
                }
                let progressRad = parseInt((progress / progressVal) * 100);

                var y = {
                    chart: {
                        height: 280,
                        type: "radialBar",
                    },

                    series: [progressRad],
                    colors: ["#20E647"],
                    plotOptions: {
                        radialBar: {
                            hollow: {
                                margin: 0,
                                size: "70%",
                                background: "#293450"
                            },
                            track: {
                                dropShadow: {
                                    enabled: true,
                                    top: 2,
                                    left: 0,
                                    blur: 4,
                                    opacity: 0.15
                                }
                            },
                            dataLabels: {
                                name: {
                                    offsetY: -10,
                                    color: "#fff",
                                    fontSize: "13px"
                                },
                                value: {
                                    color: "#fff",
                                    fontSize: "30px",
                                    show: true
                                }
                            }
                        }
                    },
                    fill: {
                        type: "gradient",
                        gradient: {
                            shade: "dark",
                            type: "horizontal",
                            gradientToColors: ["coral"],
                            stops: [0, 100]
                        }
                    },
                    stroke: {
                        lineCap: "round"
                    },
                    labels: ["Progress"]
                };

                var chart = new ApexCharts(document.querySelector("#progress"), y);

                chart.render();

                for (var i = 0; i < data.data.length; i++) {
                    var completeVal = i + 1;
                }
                console.log("comVal", completeVal)
                let completeRad = parseInt((complete / completeVal) * 100);
                console.log("comRad", completeRad)
                var z = {
                    chart: {
                        height: 280,
                        type: "radialBar",
                    },

                    series: [completeRad],
                    colors: ["#20E647"],
                    plotOptions: {
                        radialBar: {
                            hollow: {
                                margin: 0,
                                size: "70%",
                                background: "#293450"
                            },
                            track: {
                                dropShadow: {
                                    enabled: true,
                                    top: 2,
                                    left: 0,
                                    blur: 4,
                                    opacity: 0.15
                                }
                            },
                            dataLabels: {
                                name: {
                                    offsetY: -10,
                                    color: "#fff",
                                    fontSize: "13px"
                                },
                                value: {
                                    color: "#fff",
                                    fontSize: "30px",
                                    show: true
                                }
                            }
                        }
                    },
                    fill: {
                        type: "gradient",
                        gradient: {
                            shade: "dark",
                            type: "vertical",
                            gradientToColors: ["#87D4F9"],
                            stops: [0, 100]
                        }
                    },
                    stroke: {
                        lineCap: "round"
                    },
                    labels: ["Progress"]
                };

                var chart = new ApexCharts(document.querySelector("#complete"), z);
                chart.render();
            }
        });
    });

    /*document.getElementById("Logout").addEventListener("click", function () {

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/Login/Logout", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                window.location.href = "/Login";
            }
        };
    })*/

});

$("#btnUI").click(function (e) {
    e.preventDefault();
    if ($("#formModal").valid()) {
        var data_action = $(this).attr("data-name");
        if (data_action == "insert") {
            Insert();
        } else if (data_action == "update") {
            Update();
        }
    }
    else Swal.fire(
        'Oops...',
        'Check your input field carefully !',
        'error'
    )
})

function InsertData() {
    clearModalUI();
}

function clearModalUI() {
    $('#headName').html("Create Project");
    $('#id').val("");
    $('#id').removeAttr("disabled");
    $('#name').val("");
    $("[name=status]").attr('checked', false);
    $('#startDate').val("");
    $('#endDate').val("");
    $('#manager').removeAttr("disabled");
    $("[name=employees]").attr('checked', false);
    $('#description').val("");
    $('#btnUI').attr('data-name', 'insert').html("<span class='fas fa-save'>&nbsp;</span>Save");
}

// Insert Emplyoee

function Insert() {
    let status;

    if ($("#pendingRadio").prop("checked")) {
        status = 0;
    }
    else if ($("#progressRadio").prop("checked")) {
        status = 1;
    } else {
        status = 2;
    }

    let table = $("#tableProjects").DataTable();
    var obj = new Object();
    obj.id = $("#id").val();
    obj.name = $("#name").val();
    obj.status = status;
    obj.startDate = $("#startDate").val();
    obj.endDate = $("#startDate").val();
    obj.managerId = parseInt($("#manager").val());
    obj.employeeId = parseInt($("#employee").val());
    obj.description = $("#description").val();
    console.log(obj);
    $.ajax({
        url: "https://localhost:7261/api/projectlists",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(obj)
    }).done((result) => {
        $('#modalUI').modal('hide');
        Swal.fire(
            'Successfully Create Project!',
            'Project has been added!',
            'success',
        )
        table.ajax.reload(false);
    }).fail((error) => {
        Swal.fire(
            'Oops...',
            'Check your input field carefully !',
            'error'
        )

    })
}

// Open modal update
function modalUpdate(id) {
    $.ajax({
        url: "https://localhost:7261/api/projectlists/masterprojectlist/" + id,
    }).done((result) => {
        $.ajax({
            url: "https://localhost:7261/api/Employees/masteremployees",
            type: "GET",
            dataType: "Json",
            typeof: "data",
            success: function (data) {
                $('#headName').html("Update Project");
                $('#id').val(result.data[0].id);
                $('#id').attr("disabled", "true");
                $('#name').val(result.data[0].name);
                $("[name=status][value=" + result.data[0].status + "]").attr('checked', 'checked');
                var sdate = result.data[0].startDate;
                var tmp = new Date(sdate);
                var sdate_modified = tmp.getFullYear() + '-' + ((tmp.getMonth() > 8) ? (tmp.getMonth() + 1) : ('0' + (tmp.getMonth() + 1))) + '-' + ((tmp.getDate() > 9) ? tmp.getDate() : ('0' + tmp.getDate()));
                $('#startDate').val(sdate_modified);
                var edate = result.data[0].endDate;
                var tmp = new Date(edate);
                var edate_modified = tmp.getFullYear() + '-' + ((tmp.getMonth() > 8) ? (tmp.getMonth() + 1) : ('0' + (tmp.getMonth() + 1))) + '-' + ((tmp.getDate() > 9) ? tmp.getDate() : ('0' + tmp.getDate()));
                $('#endDate').val(edate_modified);
                let mId = result.data[0].managerId;
                $('#manager').val(mId);
                $('#manager').attr("disabled", "true");
                let emp = "";
                for (let i = 0; i < data.data.length; i++) {
                    if (mId == data.data[i].managerId) {
                        emp += `<option value="${data.data[i].id}">${data.data[i].fullName}</option>`
                       
                        }
                   /* else if (mId == data.data[i].managerId) {
                            emp += `<option value="${data.data[i].id}">${data.data[i].fullName}</option>`
                        }
                    else if (mId == data.data[i].managerId) {
                            emp += `<option value="${data.data[i].id}">${data.data[i].fullName}</option>`
                        } */
                }
                console.log("emp=",emp);
                $('#employee').html(emp);
                $('#description').val(result.data[0].description);
                $('#btnUI').attr('data-name', 'update').html("<span class='fas fa-pencil'>&nbsp;</span>Update");
            }
        });
    });
}

// Update Project
function Update() {
    let table = $("#tableProjects").DataTable();
    let status;

    if ($("#pendingRadio").prop("checked")) {
        status = 0;
    }
    else if ($("#progressRadio").prop("checked")) {
        status = 1;
    } else {
        status = 2;
    }
    var newObj = new Object();
    newObj.id = $("#id").val();
    newObj.name = $("#name").val();
    newObj.status = status;
    newObj.startDate = $("#startDate").val();
    newObj.endDate = $("#endDate").val();
    newObj.managerId = $("#manager").val();
    newObj.employeeId = parseInt($("#employee").val());
    newObj.description = $("#description").val();
    console.log(newObj);
    $.ajax({
        url: "https://localhost:7261/api/projectlists",
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(newObj)
    }).done((result) => {
        $('#modalUI').modal('hide');
        Swal.fire(
            'Successfully Update!',
            'Project with' + newObj.id + 'has been updated!',
            'success',
        )
        table.ajax.reload(false);
    }).fail((error) => {
        Swal.fire(
            'Oops...',
            'Check your input field carefully !',
            'error'
        )
    });
}

// Delete Employee
$(document).on('click', '#Delete', function () {
    let table = $("#tableProjects").DataTable();
    let id = table.row($(this).parent()).data().id;
    console.log(id);
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: "DELETE",
                url: "https://localhost:7261/api/projectlists?id=" + id,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: { "id": id }
            }).done((result) => {
                table.row($(this).parents('tr')).remove().draw();
                Swal.fire(
                    'Deleted!',
                    'Your project has been deleted.',
                    'success'
                )
                table.ajax.reload(false);
            }).fail((error) => {
                Swal.fire(
                    'Oops...',
                    'Something went wrong with ajax !',
                    'error'
                )
            })
        }
    })
});

$(document).ready(function () {
    $("#manager").change(function () {
        var m = ($("#manager option:selected").val());
        $.ajax({
            url: "https://localhost:7261/api/Employees/masteremployees",
            type: "GET",
            dataType: "Json",
            typeof: "data"
        }).done((result) => {
            let emp = "";
            console.log(m);
            for (let i = 0; i < result.data.length; i++) {
                if (m == result.data[i].managerId) {
                    emp += `<option value="${result.data[i].id}">${result.data[i].fullName}</option>`
                }
            }
            $("#employee").html(emp);
        }).fail((error) => {
            console.log(error);

        });
    });
});

$(document).ready(function () {
    let table = $("#tableReports").DataTable({
        ajax: {
            url: "https://localhost:7261/api/reports",
            dataType: "Json",
            dataSrc: "data"
        },
        columns: [
            {
                "data": null, "sortable": false,
                render: function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            {
                "data": "id"
            },
            {
                "data": "title"
            },
            {
                "data": "date",
                render: DataTable.render.date()
            },
            {
                "data": "progressReport"
            },
            {
                "data": "status",
                render: function (data, type, row) {
                    if (row.status == 0) {
                        return `<span class="badge rounded-pill bg-danger"
                                rel="tooltip"
                                data-bs-placement="top"
                                title="Pending"
                                >Pending</span>`
                    } else if (row.status == 1) {
                        return `<span class="badge rounded-pill bg-warning"
                                rel="tooltip"
                                data-bs-placement="top"
                                title="On Progress"
                                >On Progress</span>`
                    } else {
                        return `<span class="badge rounded-pill bg-success"
                                rel="tooltip"
                                data-bs-placement="top"
                                title="On Progress"
                                >Complete</span>`
                    }
                }
            },
            {
                "data": "doneBy"
            },
            {
                "data": "projectId"
            },
            {
                "data": "description"
            },
            {
                render: function (data, type, row) {
                    return `<button
                            class="btn btn-warning"
                            data-bs-toggle="modal"
                            data-bs-target="#modalReport"
                            onclick="modalUpdateReport('${row.id}')"
                            rel="tooltip"
                            data-bs-placement="top"
                            title="Update Button"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn btn-danger"
                            id="DeleteReport"
                            rel="tooltip"
                            data-bs-placement="top"
                            title="Delete Button"><i class="far fa-trash-alt"></i></button>`
                }
            },
        ],
        dom: '<"top"Blf>rtip',
        buttons: [
            {
                extend: 'copyHtml5',
                text: '<i class="bx bx-file"></i> Copy',
                titleAttr: 'Copy',
                className: 'btn btn-warning btn-xs mb-3 mt-3',
            },
            {
                extend: 'excelHtml5',
                text: '<i class="bx bx-file"></i> Excel',
                titleAttr: 'Excel',
                className: 'btn btn-success btn-xs mb-3 mt-3',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7]
                }
            },
            {
                extend: 'csvHtml5',
                text: '<i class="bx bx-file"></i> CSV',
                titleAttr: 'CSV',
                className: 'btn btn-dark btn-xs mb-3 mt-3',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7]
                }
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="bx bx-file"></i> PDF',
                titleAttr: 'PDF',
                className: 'btn btn-danger btn-xs mb-3 mt-3',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7]
                }
            },
            {
                extend: 'colvis',
                className: 'btn btn-default btn-xs mb-3 mt-3',
            }
        ]
    });
});

$("#btnReport").click(function (e) {
    e.preventDefault();
    if ($("#formModal").valid()) {
        var data_action = $(this).attr("data-name");
        if (data_action == "insert") {
            InsertDataReport();
        } else if (data_action == "update") {
            UpdateDataReport();
        }
    }
    else Swal.fire(
        'Oops...',
        'Check your input field carefully !',
        'error'
    )
})

function InsertReport() {
    clearModalReport();
}

function clearModalReport() {
    $('#headName').html("Create Report");
    $('#id').val("").hide();
    $('#title').val("");
    $('#progressReport').val("");
    $('#date').val("");
    $("[name=status]").attr('checked', false);
    $('#doneBy').val("");
    $('#projectId').val("");
    $('#description').val("");
    $('#btnReport').attr('data-name', 'insert').html("<span class='fas fa-save'>&nbsp;</span>Save");
}

// Open modal update

function modalUpdateReport(id) {
    $.ajax({
        url: "https://localhost:7261/api/reports/"+id,
    }).done((result) => {
        $('#headName').html("Update Report");
        $('#id').val(result.data.id).hide();
        $('#title').val(result.data.title);
        $('#progressReport').val(result.data.progressReport);
        var date = result.data.date;
        var tmp = new Date(date);
        var date_modified = tmp.getFullYear() + '-' + ((tmp.getMonth() > 8) ? (tmp.getMonth() + 1) : ('0' + (tmp.getMonth() + 1))) + '-' + ((tmp.getDate() > 9) ? tmp.getDate() : ('0' + tmp.getDate()));
        $('#date').val(date_modified);
        $("[name=status][value=" + result.data.status + "]").attr('checked', 'checked');
        $('#doneBy').val(result.data.doneBy);
        $('#projectId').val(result.data.projectId);
        $('#description').val(result.data.description);
        $('#btnReport').attr('data-name', 'update').html("<span class='fas fa-pencil'>&nbsp;</span>Update");
    }).fail((error) => {
        Swal.fire(
            'Oops...',
            'Something went wrong with ajax !',
            'error'
        )
    })
}

// Update Employee

function UpdateDataReport() {
    let statusReport;

    if ($("#pendingStat").prop("checked")) {
        statusReport = 0;
    }
    else if ($("#progressStat").prop("checked")) {
        statusReport = 1;
    } else {
        statusReport = 2;
    }
    let table = $("#tableReports").DataTable();
    var newObj = new Object();
    newObj.id = $("#id").val();
    newObj.title = $("#title").val();
    newObj.progressReport = $("#progressReport").val();
    newObj.date = $("#date").val();
    newObj.status = statusReport;
    newObj.doneBy = $("#doneBy").val();
    newObj.projectId = $("#projectId").val();
    newObj.description = $("#description").val();
    console.log(newObj);
    $.ajax({
        url: "https://localhost:7261/api/reports",
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(newObj)
    }).done((result) => {
        $('#modalReport').modal('hide');
        Swal.fire(
            'Successfully Update!',
            'Report project' + newObj.projectId + 'has been updated!',
            'success',
        )
        table.ajax.reload(false);
    }).fail((error) => {
        Swal.fire(
            'Oops...',
            'Check your input field carefully !',
            'error'
        )
    });
}

// Delete Employee

$(document).on('click', '#DeleteReport', function () {
    let table = $("#tableReports").DataTable();
    let id = table.row($(this).parent()).data().id;
    console.log(id);
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: "DELETE",
                url: "https://localhost:7261/api/reports?id=" + id,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: { "id": id }
            }).done((result) => {
                table.row($(this).parents('tr')).remove().draw();
                Swal.fire(
                    'Deleted!',
                    'Your report has been deleted.',
                    'success'
                )
                table.ajax.reload(false);
            }).fail((error) => {
                Swal.fire(
                    'Oops...',
                    'Something went wrong with ajax !',
                    'error'
                )
            })
        }
    })
});










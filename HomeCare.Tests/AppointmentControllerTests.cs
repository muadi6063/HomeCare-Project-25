using Xunit;
using Moq;
using HomeCareApp.Controllers;
using HomeCareApp.Models;
using HomeCareApp.DAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net.Cache;
using System.Threading.Tasks;
using HomeCareApp.DTOs;

namespace HomeCare.Tests.Controllers;

public class AppointmentControllerTests
{
    [Fact]
    public async Task AppointmentListTestPositive()
    {
        var AppointmentList = new List<Appointment>()
        {
            // Arrange, here we are creating test-data with two appointments
            new Appointment
            {
                AppointmentId = 1,
                ClientId = "1",
                AvailableDayId = 1,
                StartTime = TimeSpan.FromHours(10),
                EndTime = TimeSpan.FromHours(11),
                TaskDescription = "Regular checkup"
            },
            new Appointment
            {
                AppointmentId = 2,
                ClientId = "2",
                AvailableDayId = 2,
                StartTime = TimeSpan.FromHours(13),
                EndTime = TimeSpan.FromHours(14),
                TaskDescription = "Need groceries: Box of eggs, 1 liter milk and toilet paper"
            }
        };
        // Arrange, setting up the mock repository to return test appointments
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.GetAll()).ReturnsAsync(AppointmentList);

        // Arrange, setting up mock logger and creating the controller
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();
        var appointmentController = new AppointmentAPIController(mockAppointmentRepository.Object, mockLogger.Object);

        // Act, calling the GetAll api endpoint
        var result = await appointmentController.AppointmentList();

        // Assert, checking if it returns back status code 200 OK, and if we got 2 appointments back
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedAppointments = Assert.IsAssignableFrom<IEnumerable<AppointmentDto>>(okResult.Value);
        Assert.Equal(2, returnedAppointments.Count());
    }

    [Fact]
    public async Task AppointmentCreateTestPositive()
    {
        var testAppointmentDto = new AppointmentDto
        {
            AppointmentId = 2,
            ClientId = "2",
            AvailableDayId = 2,
            StartTime = TimeSpan.FromHours(14),
            EndTime = TimeSpan.FromHours(15),
            TaskDescription = "Shopping assistance"        
        };
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.Create(It.IsAny<Appointment>())).ReturnsAsync(true);
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();
        var appointmentController = new AppointmentAPIController(mockAppointmentRepository.Object, mockLogger.Object);

        var result = await appointmentController.Create(testAppointmentDto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(appointmentController.GetAppointment), createdResult.ActionName);


    }
}
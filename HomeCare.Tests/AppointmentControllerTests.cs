using Xunit;
using Moq;
using HomeCareApp.Controllers;
using HomeCareApp.Models;
using HomeCareApp.DAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using HomeCareApp.DTOs;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace HomeCare.Tests.Controllers;

public class AppointmentControllerTests
{

    [Fact]
    public async Task TestAppointmentList_positive()
    {
        // Arrange - Create test data with two appointments
        var appointmentList = new List<Appointment>
        {
            new Appointment
            {
                AppointmentId = 1,
                ClientId = "client-1",
                AvailableDayId = 1,
                StartTime = TimeSpan.FromHours(10),
                EndTime = TimeSpan.FromHours(11),
                TaskDescription = "Regular checkup",
                Client = new User { Id = "client-1", Name = "John Doe", Email = "john@example.com" },
                AvailableDay = new AvailableDay 
                { 
                    Date = DateTime.Now.AddDays(1),
                    HealthcarePersonnel = new User { Name = "Dr. Smith" }
                }
            },
            new Appointment
            {
                AppointmentId = 2,
                ClientId = "client-2",
                AvailableDayId = 2,
                StartTime = TimeSpan.FromHours(14),
                EndTime = TimeSpan.FromHours(15),
                TaskDescription = "Shopping help",
                Client = new User { Id = "client-2", Name = "Jane Smith", Email = "jane@example.com" },
                AvailableDay = new AvailableDay 
                { 
                    Date = DateTime.Now.AddDays(2),
                    HealthcarePersonnel = new User { Name = "Nurse Jones" }
                }
            }
        };
        
        // Arrange - Set up mock repository
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.GetAll()).ReturnsAsync(appointmentList);

        // Arrange - Set up mock logger
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();
        
        // Arrange - Create controller with mocked user (needed for [Authorize])
        var appointmentController = new AppointmentAPIController(
            mockAppointmentRepository.Object, 
            mockLogger.Object
        );
        
        // Mock authenticated Admin user
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "admin-id"),
            new Claim(ClaimTypes.Role, "Admin")
        }, "mock"));
        
        appointmentController.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        // Act - Call the AppointmentList method
        var result = await appointmentController.AppointmentList();

        // Assert - Verify it returns OkObjectResult
        var okResult = Assert.IsType<OkObjectResult>(result);
        
        // Assert - Verify the model is a list of AppointmentDto
        var returnedAppointments = Assert.IsAssignableFrom<IEnumerable<AppointmentDto>>(okResult.Value);
        
        // Assert - Verify we got exactly 2 appointments
        Assert.Equal(2, returnedAppointments.Count());
    }

    [Fact]
    public async Task TestCreateAppointment_positive()
    {
        // Arrange: create test appointment DTO
        var testDto = new AppointmentDto
        {
            ClientId = "client-id",
            AvailableDayId = 1,
            StartTime = TimeSpan.FromHours(10),
            EndTime = TimeSpan.FromHours(11),
            TaskDescription = "Shopping help"
        };

        // Arrange: set up mock repository
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.Create(It.IsAny<Appointment>())).ReturnsAsync(true);

        // Arrange: set up mock logger
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();

        // Arrange: create controller with mocked user
        var appointmentController = new AppointmentAPIController(
            mockAppointmentRepository.Object,
            mockLogger.Object
        );

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "client-id"),
            new Claim(ClaimTypes.Role, "Client")
        }, "mock"));

        appointmentController.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        // Act: call the create method
        var result = await appointmentController.Create(testDto);

        // Assert: verify it returns createdAtActionResult
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(appointmentController.GetAppointment), createdResult.ActionName);
    }
}
    
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
        // Arrange: create test data with two appointments
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
        
        // Arrange: set up mock repository
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.GetAll()).ReturnsAsync(appointmentList);

        // Arrange: set up mock logger
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();
        var mockAvailableDayRepository = new Mock<IAvailableDayRepository>();
        
        // Arrange: create controller with mocked user (needed for [Authorize])
        var appointmentController = new AppointmentAPIController(
            mockAppointmentRepository.Object, 
            mockLogger.Object,
            mockAvailableDayRepository.Object
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
        var mockAvailableDayRepository = new Mock<IAvailableDayRepository>();
        mockAvailableDayRepository.Setup(repo => repo.GetAvailableDayById(1)).ReturnsAsync(new AvailableDay
        {
            AvailableDayId = 1,
            HealthcarePersonnelId = "personnel-id",
            Date = DateTime.Now.AddDays(1),
            StartTime = TimeSpan.FromHours(10),
            EndTime = TimeSpan.FromHours(11)
        });

        // Arrange: create controller with mocked user
        var appointmentController = new AppointmentAPIController(
            mockAppointmentRepository.Object,
            mockLogger.Object,
            mockAvailableDayRepository.Object
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

    [Fact]
    public async Task TestUpdateAppointment_positive()
    {
        // Arrange: create test appointment DTO
        var exisitingAppointment = new Appointment
        {
            AppointmentId = 1,
            ClientId = "client-id",
            AvailableDayId = 1,
            StartTime = TimeSpan.FromHours(10),
            EndTime = TimeSpan.FromHours(11),
            TaskDescription = "Shopping help"
        };

        var updatedAppointmentDto = new AppointmentDto
        {
            AppointmentId = 1,
            ClientId = "client-id",
            AvailableDayId = 2,
            StartTime = TimeSpan.FromHours(14),
            EndTime = TimeSpan.FromHours(16),
            TaskDescription = "Updated shopping help"
        };

        // Arrange: Mock getAppointmentById
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.GetAppointmentById(1)).ReturnsAsync(exisitingAppointment);

        // Mock Update
        mockAppointmentRepository.Setup(repo => repo.Update(It.IsAny<Appointment>())).ReturnsAsync(true);

        // Arrange: set up mock logger
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();
        var mockAvailableDayRepository = new Mock<IAvailableDayRepository>();
        mockAvailableDayRepository.Setup(repo => repo.GetAvailableDayById(2)).ReturnsAsync(new AvailableDay
        {
            AvailableDayId = 2,
            HealthcarePersonnelId = "personnel-id",
            Date = DateTime.Now.AddDays(1),
            StartTime = TimeSpan.FromHours(14),
            EndTime = TimeSpan.FromHours(16)
        });

        // Arrange: create controller with mocked user
        var appointmentController = new AppointmentAPIController(
            mockAppointmentRepository.Object,
            mockLogger.Object,
            mockAvailableDayRepository.Object
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
        var result = await appointmentController.Update(1, updatedAppointmentDto);

        // Assert: verify it returns HTTP 200 OK
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedAppointment = Assert.IsType<Appointment>(okResult.Value);

        // Assert: verify the appointment was updated with new data
        Assert.Equal("Updated shopping help", returnedAppointment.TaskDescription);
        Assert.Equal(2, returnedAppointment.AvailableDayId);
        Assert.Equal(TimeSpan.FromHours(14), returnedAppointment.StartTime);

        // Assert: verify repository methods were called
        mockAppointmentRepository.Verify(repo => repo.GetAppointmentById(1), Times.Once);
        mockAppointmentRepository.Verify(repo => repo.Update(It.IsAny<Appointment>()), Times.Once);
    }

    [Fact]
    public async Task TestDeleteAppointment_positive()
    {
        // Arrange: create test appointment DTO
        var appointmentToDelete = new Appointment
        {
            AppointmentId = 1,
            ClientId = "client-id",
            AvailableDayId = 1,
            StartTime = TimeSpan.FromHours(10),
            EndTime = TimeSpan.FromHours(11),
            TaskDescription = "Appointment to be deleted"
        };

        // Arrange: set up mock repository
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();

        // Gets the appointment that is going to be deleted
        mockAppointmentRepository.Setup(repo => repo.GetAppointmentById(1)).ReturnsAsync(appointmentToDelete);

        // Delete the appointment and return true
        mockAppointmentRepository.Setup(repo => repo.Delete(1)).ReturnsAsync(true);

        // Arrange: set up mock logger
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();
        var mockAvailableDayRepository = new Mock<IAvailableDayRepository>();

        // Arrange: create controller with mocked user
        var appointmentController = new AppointmentAPIController(
            mockAppointmentRepository.Object,
            mockLogger.Object,
            mockAvailableDayRepository.Object
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
        var result = await appointmentController.DeleteConfirmed(1);

        // Assert: verify it returns HTTP 204 No Content
        Assert.IsType<NoContentResult>(result);

        // Assert: verify GetAppointmentById was called
        mockAppointmentRepository.Verify(repo => repo.GetAppointmentById(1), Times.Once);

        // Assert: verify Delete was called with correct ID
        mockAppointmentRepository.Verify(repo => repo.Delete(1), Times.Once);
    }

    [Fact]
    public async Task TestAppointmentList_negative()
    {
        // Arrange: set up mock repository to return NULL
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.GetAll()).ReturnsAsync((IEnumerable<Appointment>?)null);

        // Arrange: set up mock logger and controller
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();
        var mockAvailableDayRepository = new Mock<IAvailableDayRepository>();
        
        var appointmentController = new AppointmentAPIController(
            mockAppointmentRepository.Object,
            mockLogger.Object,
            mockAvailableDayRepository.Object
        );

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "admin-id"),
            new Claim(ClaimTypes.Role, "Admin")
        }, "mock"));

        appointmentController.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        // Act: call the AppointmentList method
        var result = await appointmentController.AppointmentList();

        // Assert: verify it returns HTTP 404 Not Found
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Appointment list not found", notFoundResult.Value);
        
        // Assert: verify GetAll was called
        mockAppointmentRepository.Verify(repo => repo.GetAll(), Times.Once);
    }

    [Fact]
    public async Task TestCreateAppointment_negative()
    {
        // Arrange: create valid appointment DTO
        var testDto = new AppointmentDto
        {
            ClientId = "client-id",
            AvailableDayId = 1,
            StartTime = TimeSpan.FromHours(10),
            EndTime = TimeSpan.FromHours(11),
            TaskDescription = "Shopping help"
        };

        // Arrange: set up mock repository to FAIL by returning false
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.Create(It.IsAny<Appointment>())).ReturnsAsync(false);

        // Arrange: set up mock logger and controller
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();
        var mockAvailableDayRepository = new Mock<IAvailableDayRepository>();
        mockAvailableDayRepository.Setup(repo => repo.GetAvailableDayById(1)).ReturnsAsync(new AvailableDay
        {
            AvailableDayId = 1,
            HealthcarePersonnelId = "personnel-id",
            Date = DateTime.Now.AddDays(1),
            StartTime = TimeSpan.FromHours(10),
            EndTime = TimeSpan.FromHours(11)
        });

        var appointmentController = new AppointmentAPIController(
            mockAppointmentRepository.Object,
            mockLogger.Object,
            mockAvailableDayRepository.Object
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

        // Act: call the Create method
        var result = await appointmentController.Create(testDto);

        // Assert: verify it returns HTTP 500 Internal Server Error
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusCodeResult.StatusCode);

        // Assert: verify Create was still called (but failed)
        mockAppointmentRepository.Verify(repo => repo.Create(It.IsAny<Appointment>()), Times.Once);
    }
    
    [Fact]
    public async Task TestUpdateAppointment_negative()
    {
        // Arrange: create appointment DTO for non existent appointment
        var updatedAppointmentDto = new AppointmentDto
        {
            AppointmentId = 999,  // Id does not exist
            ClientId = "client-id",
            AvailableDayId = 2,
            StartTime = TimeSpan.FromHours(14),
            EndTime = TimeSpan.FromHours(16),
            TaskDescription = "Updated shopping help"
        };

        // Arrange: Mock GetAppointmentById to return null
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.GetAppointmentById(999)).ReturnsAsync((Appointment?)null);

        // Arrange: set up mock logger
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();
        var mockAvailableDayRepository = new Mock<IAvailableDayRepository>();

        // Arrange: create controller with mocked user
        var appointmentController = new AppointmentAPIController(
            mockAppointmentRepository.Object,
            mockLogger.Object,
            mockAvailableDayRepository.Object
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

        // Act: call the Update method with non-existent ID
        var result = await appointmentController.Update(999, updatedAppointmentDto);

        // Assert: verify it returns HTTP 404 Not Found
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Appointment not found", notFoundResult.Value);

        // Assert: verify GetAppointmentById was called
        mockAppointmentRepository.Verify(repo => repo.GetAppointmentById(999), Times.Once);
        
        // Assert: verify Update was NEVER called since appointment doesn't exist
        mockAppointmentRepository.Verify(repo => repo.Update(It.IsAny<Appointment>()), Times.Never);
    }

    [Fact]
    public async Task TestDeleteAppointment_negative()
    {
        // Arrange: Mock GetAppointmentById to return null
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.GetAppointmentById(999)).ReturnsAsync((Appointment?)null);

        // Arrange: set up mock logger
        var mockLogger = new Mock<ILogger<AppointmentAPIController>>();
        var mockAvailableDayRepository = new Mock<IAvailableDayRepository>();

        // Arrange: create controller with mocked user
        var appointmentController = new AppointmentAPIController(
            mockAppointmentRepository.Object,
            mockLogger.Object,
            mockAvailableDayRepository.Object
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

        // Act: call the DeleteConfirmed method with non existent ID
        var result = await appointmentController.DeleteConfirmed(999);

        // Assert: verify it returns HTTP 404 Not Found
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Appointment not found", notFoundResult.Value);

        // Assert: verify GetAppointmentById was called
        mockAppointmentRepository.Verify(repo => repo.GetAppointmentById(999), Times.Once);
        
        // Assert: verify Delete was never called since appointment does not exist
        mockAppointmentRepository.Verify(repo => repo.Delete(It.IsAny<int>()), Times.Never);
    }

}
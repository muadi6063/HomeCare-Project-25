using Xunit;
using Moq;
using HomeCareApp.Controllers;
using HomeCareApp.Models;
using HomeCareApp.DAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net.Cache;
using System.Threading.Tasks;

namespace HomeCare.Tests.Controllers;
public class AppointmentControllerTests
{
    [Fact]
    public async Task AppointmentListTest()
    {
        var AppointmentList = new List<Appointment>()
        {
            // Arrange, here we are creating test-data with two appointments
            new Appointment
            {
                AppointmentId = 1,
                ClientId = 1,
                AvailableDayId = 1,
                Notes = "Regular checkup",
                Client = new User { UserId = 1, Name = "John Doe" },
                AvailableDay = new AvailableDay
                {
                    AvailableDayId = 1,
                    Date = DateTime.Now.AddDays(1),
                    StartTime = TimeSpan.FromHours(10),
                    EndTime = TimeSpan.FromHours(11)
                }
            },
            new Appointment
            {
                AppointmentId = 2,
                ClientId = 2,
                AvailableDayId = 2,
                Notes = "Shopping and cleaning",
                Client = new User { UserId = 1, Name = "Sarah Smith" },
                AvailableDay = new AvailableDay
                {
                    AvailableDayId = 2,
                    Date = DateTime.Now.AddDays(4),
                    StartTime = TimeSpan.FromHours(14),
                    EndTime = TimeSpan.FromHours(15)
                }
            }
        };
        // Arrange, setting up the mock repository to return test appointments
        var mockAppointmentRepository = new Mock<IAppointmentRepository>();
        mockAppointmentRepository.Setup(repo => repo.GetAll().returnsAsync(AppointmentList));

        // Arrange, setting up mock logger and creating the controller
        var mockLogger = new Mock<ILogger<AppointmentController>>();
        var appointmentController = new AppointmentController(mockAppointmentRepository.Object, mockLogger.Object);

        // Act, calling the GetAll api endpoint
        var result = await appointmentController.GetAll();

        // Assert, checking if it returns back status code 200 OK, and if we got 2 appointments back
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedAppointments = Assert.IsAssignableFrom<IEnumerable<Appointment>>(okResult.Value);
        Assert.Equal(2, returnedAppointments.Count());
    }
}

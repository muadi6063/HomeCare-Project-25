using Serilog;
using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;
using HomecareApp.DAL;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews()
    .AddNewtonsoftJson(options =>
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddDbContext<HomeCareDbContext>(options =>
{
    options.UseSqlite(
        builder.Configuration["ConnectionStrings:HomeCareDbContextConnection"]);
});

var loggerConfiguration = new LoggerConfiguration()
.MinimumLevel.Information()
.WriteTo.Console()
.WriteTo.File($"Logs/app_{DateTime.Now:yyyyMMdd_HHmmss}.log");

var logger = loggerConfiguration.CreateLogger();
builder.Logging.AddSerilog(logger);

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IAvailableDayRepository, AvailableDayRepository>();

var app = builder.Build();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    DBInit.Seed(app);
    // ADD: Swagger UI
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// ADD: CORS
app.UseCors();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// ADD: API controllers mapping
app.MapControllers();

app.Run();
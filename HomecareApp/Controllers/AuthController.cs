using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HomeCareApp.Models;
using HomeCareApp.DTOs;

namespace HomeCareApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthAPIController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthAPIController> _logger;

    public AuthAPIController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration configuration,
        ILogger<AuthAPIController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _logger = logger;
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = new User
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            Name = registerDto.Name,
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, registerDto.Role);
            _logger.LogInformation("[AuthController] User registered: {Username}", registerDto.Username);
            return Ok(new { message = "User registered successfully" });
        }
        _logger.LogWarning("Invalid registration for {username}", registerDto.Username);
        return BadRequest(new { message = result.Errors.First().Description });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        var user = await _userManager.FindByNameAsync(loginDto.Username);
        if (user != null && await _userManager.CheckPasswordAsync(user, loginDto.Password))
        {
            _logger.LogInformation("[AuthAPIController] User logged in: {@username}", loginDto.Username);
            var token = await GenerateJwtToken(user);
            var roles = await _userManager.GetRolesAsync(user);


            return Ok(new
            {
                token
            });
        }
        _logger.LogWarning("Invalid login for {username}", loginDto.Username);
        return Unauthorized(new { message = "Invalid username or password" });
    }


    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        _logger.LogInformation("[AuthController] User logged out: {Username}", User.Identity?.Name);
        return Ok(new { message = "Logout successful" });
    }

    [HttpPost("ResetPassword")] // Dobbeltsjekk denne metoden
    public async Task<IActionResult> ResetPassword(string userId, string token, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound("User not found");

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        if (result.Succeeded)
            return Ok(new { message = "Password set successfully" });
        
        _logger.LogWarning("Failed setting password for {Username}", user.UserName);
        return BadRequest(result.Errors);
    }


    private async Task<string> GenerateJwtToken(User user)
    {
        var secret = _configuration["JwtSettings:SecretKey"];
        if (string.IsNullOrEmpty(secret))
        {
            _logger.LogError("[AuthAPIController] JWT Key is missing from configuration");
            throw new InvalidOperationException("JWT is missing from configuration");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var roles = await _userManager.GetRolesAsync(user);


        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id ??""),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id ?? ""),
            new Claim(ClaimTypes.Name, user.Name ?? "") 
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(50),
            signingCredentials: creds
        );
        _logger.LogInformation("[AuthAPIController] JWT token created for {@username}", user.UserName);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
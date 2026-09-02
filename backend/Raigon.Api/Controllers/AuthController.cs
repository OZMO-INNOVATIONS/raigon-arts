using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Raigon.Api.Data;
using Raigon.Api.Models;

namespace Raigon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly RaigonDbContext _context;

    public AuthController(RaigonDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var email = request.Email.Trim().ToLower();
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email && u.Password == request.Password);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(new
        {
            success = true,
            email = user.Email,
            name = user.Name,
            role = user.Role
        });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

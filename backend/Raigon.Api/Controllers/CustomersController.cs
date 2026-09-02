using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Raigon.Api.Data;
using Raigon.Api.Models;

namespace Raigon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly RaigonDbContext _context;

    public CustomersController(RaigonDbContext context)
    {
        _context = context;
    }

    // GET: api/customers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
    {
        var customers = await _context.Customers
            .AsNoTracking()
            .ToListAsync();

        return Ok(customers);
    }

    // GET: api/customers/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Customer>> GetCustomer(string id)
    {
        var customer = await _context.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null)
        {
            return NotFound(new { message = $"Customer with ID {id} not found." });
        }

        return Ok(customer);
    }

    // POST: api/customers
    [HttpPost]
    public async Task<ActionResult<Customer>> CreateCustomer(Customer customer)
    {
        var existingIds = await _context.Customers
            .Select(c => c.Id)
            .ToListAsync();

        int maxNum = 1000;
        foreach (var id in existingIds)
        {
            var digits = System.Text.RegularExpressions.Regex.Match(id, @"\d+").Value;
            if (int.TryParse(digits, out int num) && num > maxNum)
            {
                maxNum = num;
            }
        }

        // If ID is empty, duplicate, or smaller than latest sequence, assign next unique sequential ID
        if (string.IsNullOrWhiteSpace(customer.Id) || existingIds.Contains(customer.Id))
        {
            customer.Id = $"RA-{maxNum + 1}";
        }
        else
        {
            var match = System.Text.RegularExpressions.Regex.Match(customer.Id, @"\d+");
            if (match.Success && int.TryParse(match.Value, out int clientNum) && clientNum <= maxNum)
            {
                customer.Id = $"RA-{maxNum + 1}";
            }
        }

        customer.Photos = CleanPhotoNames(customer.Photos);
        customer.Name = (customer.Name ?? string.Empty).Trim();
        customer.Phone = (customer.Phone ?? string.Empty).Trim();
        customer.City = (customer.City ?? string.Empty).Trim();
        customer.Address = (customer.Address ?? string.Empty).Trim();
        customer.Pincode = (customer.Pincode ?? string.Empty).Trim();
        customer.AltPhone = (customer.AltPhone ?? string.Empty).Trim();
        customer.FrameSize = (customer.FrameSize ?? string.Empty).Trim();
        customer.FrameType = (customer.FrameType ?? string.Empty).Trim();
        customer.Material = (customer.Material ?? string.Empty).Trim();
        customer.Color = (customer.Color ?? string.Empty).Trim();
        customer.Orientation = (customer.Orientation ?? string.Empty).Trim();
        customer.Notes = (customer.Notes ?? string.Empty).Trim();
        customer.OrderDate = !string.IsNullOrWhiteSpace(customer.OrderDate) ? customer.OrderDate.Trim() : DateTime.Now.ToString("MMM dd, yyyy");
        customer.DeliveryDate = (customer.DeliveryDate ?? string.Empty).Trim();
        customer.PaymentStatus = !string.IsNullOrWhiteSpace(customer.PaymentStatus) ? customer.PaymentStatus.Trim() : "Pending";
        customer.OrderStatus = !string.IsNullOrWhiteSpace(customer.OrderStatus) ? customer.OrderStatus.Trim() : "Pending";

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    // PUT: api/customers/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(string id, Customer updatedCustomer)
    {
        var existing = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == id);

        if (existing == null)
        {
            // Upsert: If the customer record does not exist in the DB, create it
            updatedCustomer.Id = id;
            updatedCustomer.Photos = CleanPhotoNames(updatedCustomer.Photos);
            updatedCustomer.Name = (updatedCustomer.Name ?? string.Empty).Trim();
            updatedCustomer.Phone = (updatedCustomer.Phone ?? string.Empty).Trim();
            updatedCustomer.City = (updatedCustomer.City ?? string.Empty).Trim();
            updatedCustomer.Address = (updatedCustomer.Address ?? string.Empty).Trim();
            updatedCustomer.Pincode = (updatedCustomer.Pincode ?? string.Empty).Trim();
            updatedCustomer.AltPhone = (updatedCustomer.AltPhone ?? string.Empty).Trim();
            updatedCustomer.FrameSize = (updatedCustomer.FrameSize ?? string.Empty).Trim();
            updatedCustomer.FrameType = (updatedCustomer.FrameType ?? string.Empty).Trim();
            updatedCustomer.Material = (updatedCustomer.Material ?? string.Empty).Trim();
            updatedCustomer.Color = (updatedCustomer.Color ?? string.Empty).Trim();
            updatedCustomer.Orientation = (updatedCustomer.Orientation ?? string.Empty).Trim();
            updatedCustomer.Notes = (updatedCustomer.Notes ?? string.Empty).Trim();
            updatedCustomer.OrderDate = !string.IsNullOrWhiteSpace(updatedCustomer.OrderDate) ? updatedCustomer.OrderDate.Trim() : DateTime.Now.ToString("MMM dd, yyyy");
            updatedCustomer.DeliveryDate = (updatedCustomer.DeliveryDate ?? string.Empty).Trim();
            updatedCustomer.PaymentStatus = !string.IsNullOrWhiteSpace(updatedCustomer.PaymentStatus) ? updatedCustomer.PaymentStatus.Trim() : "Pending";
            updatedCustomer.OrderStatus = !string.IsNullOrWhiteSpace(updatedCustomer.OrderStatus) ? updatedCustomer.OrderStatus.Trim() : "Pending";

            _context.Customers.Add(updatedCustomer);
            await _context.SaveChangesAsync();
            return Ok(updatedCustomer);
        }

        // Update fields
        existing.Name = (updatedCustomer.Name ?? string.Empty).Trim();
        existing.Phone = (updatedCustomer.Phone ?? string.Empty).Trim();
        existing.AltPhone = (updatedCustomer.AltPhone ?? string.Empty).Trim();
        existing.City = (updatedCustomer.City ?? string.Empty).Trim();
        existing.Address = (updatedCustomer.Address ?? string.Empty).Trim();
        existing.Pincode = (updatedCustomer.Pincode ?? string.Empty).Trim();
        existing.FrameSize = (updatedCustomer.FrameSize ?? string.Empty).Trim();
        existing.FrameType = (updatedCustomer.FrameType ?? string.Empty).Trim();
        existing.Material = (updatedCustomer.Material ?? string.Empty).Trim();
        existing.Color = (updatedCustomer.Color ?? string.Empty).Trim();
        existing.Orientation = (updatedCustomer.Orientation ?? string.Empty).Trim();
        existing.Quantity = updatedCustomer.Quantity;
        existing.Notes = (updatedCustomer.Notes ?? string.Empty).Trim();
        existing.OrderDate = !string.IsNullOrWhiteSpace(updatedCustomer.OrderDate) ? updatedCustomer.OrderDate.Trim() : existing.OrderDate;
        existing.DeliveryDate = (updatedCustomer.DeliveryDate ?? string.Empty).Trim();
        existing.TotalAmount = updatedCustomer.TotalAmount;
        existing.AdvancePaid = updatedCustomer.AdvancePaid;
        existing.BalanceAmount = updatedCustomer.BalanceAmount;
        existing.PaymentStatus = !string.IsNullOrWhiteSpace(updatedCustomer.PaymentStatus) ? updatedCustomer.PaymentStatus.Trim() : existing.PaymentStatus;
        existing.OrderStatus = !string.IsNullOrWhiteSpace(updatedCustomer.OrderStatus) ? updatedCustomer.OrderStatus.Trim() : existing.OrderStatus;
        existing.Photos = CleanPhotoNames(updatedCustomer.Photos);
        _context.Entry(existing).Property(c => c.Photos).IsModified = true;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE: api/customers/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(string id)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null)
        {
            return NotFound(new { message = $"Customer with ID {id} not found." });
        }

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static List<string> CleanPhotoNames(List<string>? photos)
    {
        if (photos == null || photos.Count == 0) return new List<string>();

        var result = new List<string>();
        foreach (var photo in photos)
        {
            if (string.IsNullOrWhiteSpace(photo)) continue;

            // Skip base64 strings
            if (photo.StartsWith("data:", StringComparison.OrdinalIgnoreCase)) continue;

            var clean = photo.Trim();
            var qIdx = clean.IndexOf('?');
            if (qIdx >= 0) clean = clean.Substring(0, qIdx);
            var hIdx = clean.IndexOf('#');
            if (hIdx >= 0) clean = clean.Substring(0, hIdx);

            var fileName = System.IO.Path.GetFileName(clean);
            if (!string.IsNullOrWhiteSpace(fileName) && !result.Contains(fileName))
            {
                result.Add(fileName);
            }
        }
        return result;
    }
}

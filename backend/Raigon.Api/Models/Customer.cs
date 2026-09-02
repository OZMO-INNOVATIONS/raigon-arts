using System.Collections.Generic;

namespace Raigon.Api.Models;

public class Customer
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string? City { get; set; } = string.Empty;

    public string? Address { get; set; } = string.Empty;

    public string? Pincode { get; set; } = string.Empty;

    public string? AltPhone { get; set; } = string.Empty;

    public string FrameSize { get; set; } = string.Empty;

    public string FrameType { get; set; } = string.Empty;

    public int Quantity { get; set; } = 1;

    public decimal TotalAmount { get; set; }

    public decimal AdvancePaid { get; set; }

    public decimal BalanceAmount { get; set; }

    public string PaymentStatus { get; set; } = "Pending";

    public string OrderStatus { get; set; } = "Pending";

    public string OrderDate { get; set; } = string.Empty;

    public string? DeliveryDate { get; set; } = string.Empty;

    public string? Material { get; set; } = string.Empty;

    public string? Color { get; set; } = string.Empty;

    public string? Orientation { get; set; } = string.Empty;

    public string? Notes { get; set; } = string.Empty;

    public List<string> Photos { get; set; } = new();
}

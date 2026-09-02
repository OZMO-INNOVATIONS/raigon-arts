using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Raigon.Api.Models;
using System.Text.Json;

namespace Raigon.Api.Data;

public class RaigonDbContext : DbContext
{
    public RaigonDbContext(DbContextOptions<RaigonDbContext> options) : base(options)
    {
    }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired();
            entity.Property(u => u.Password).IsRequired();
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired();
            entity.Property(c => c.Phone).IsRequired();
            entity.Property(c => c.TotalAmount).HasPrecision(18, 2);
            entity.Property(c => c.AdvancePaid).HasPrecision(18, 2);
            entity.Property(c => c.BalanceAmount).HasPrecision(18, 2);

            var photoComparer = new ValueComparer<List<string>>(
                (c1, c2) => JsonSerializer.Serialize(c1, (JsonSerializerOptions?)null) == JsonSerializer.Serialize(c2, (JsonSerializerOptions?)null),
                c => c == null ? 0 : JsonSerializer.Serialize(c, (JsonSerializerOptions?)null).GetHashCode(),
                c => c == null ? new List<string>() : JsonSerializer.Deserialize<List<string>>(JsonSerializer.Serialize(c, (JsonSerializerOptions?)null), (JsonSerializerOptions?)null)!
            );

            entity.Property(c => c.Photos)
                .HasConversion(
                    v => JsonSerializer.Serialize(v ?? new List<string>(), (JsonSerializerOptions?)null),
                    v => ParsePhotoNames(v),
                    photoComparer
                )
                .HasDefaultValueSql("'[]'")
                .HasColumnType("text");
        });
    }

    private static List<string> ParsePhotoNames(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<string>();
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                var list = new List<string>();
                foreach (var el in doc.RootElement.EnumerateArray())
                {
                    if (el.ValueKind == JsonValueKind.String)
                    {
                        var s = el.GetString();
                        if (!string.IsNullOrWhiteSpace(s)) list.Add(s);
                    }
                    else if (el.ValueKind == JsonValueKind.Object)
                    {
                        if (el.TryGetProperty("Name", out var n) || el.TryGetProperty("name", out n))
                        {
                            var s = n.GetString();
                            if (!string.IsNullOrWhiteSpace(s)) list.Add(s);
                        }
                    }
                }
                return list;
            }
        }
        catch { }
        return new List<string>();
    }
}

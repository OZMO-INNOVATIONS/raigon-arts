using Microsoft.EntityFrameworkCore;
using Raigon.Api.Models;

namespace Raigon.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(RaigonDbContext context)
    {
        // Automatically create database and tables if they do not exist
        await context.Database.EnsureCreatedAsync();

        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name='Customers' AND column_name='Photos'
                    ) THEN
                        ALTER TABLE ""Customers"" ADD COLUMN ""Photos"" TEXT DEFAULT '[]';
                    END IF;
                    UPDATE ""Customers"" SET ""Photos"" = '[]' WHERE ""Photos"" IS NULL;
                END $$;
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS ""Users"" (
                    ""Id"" SERIAL PRIMARY KEY,
                    ""Email"" TEXT NOT NULL,
                    ""Password"" TEXT NOT NULL,
                    ""Name"" TEXT NOT NULL DEFAULT 'Raigon Manager',
                    ""Role"" TEXT NOT NULL DEFAULT 'Admin'
                );
            ");
        }
        catch { }

        try
        {
            if (!await context.Users.AnyAsync(u => u.Email.ToLower() == "admin@raigonarts.com"))
            {
                context.Users.Add(new User
                {
                    Email = "admin@raigonarts.com",
                    Password = "raigon@2026",
                    Name = "Raigon Manager",
                    Role = "Admin"
                });
                await context.SaveChangesAsync();
            }
        }
        catch { }

        if (await context.Customers.AnyAsync())
        {
            return; // DB customers have been seeded
        }

        var seedCustomers = new List<Customer>
        {
            new Customer
            {
                Id = "RA-1001",
                Name = "Arun Kumar",
                Phone = "9876543210",
                AltPhone = "None",
                City = "Ernakulam",
                Address = "MG Road, Kochi",
                Pincode = "682016",
                FrameSize = "12 × 18 inch",
                FrameType = "Wooden Frame",
                Material = "Solid Teak Wood",
                Color = "Dark Walnut",
                Orientation = "Portrait",
                Quantity = 2,
                Notes = "Matte glass finish with wooden bevelled border.",
                TotalAmount = 4500,
                AdvancePaid = 2000,
                BalanceAmount = 2500,
                PaymentStatus = "Partial",
                OrderStatus = "Pending",
                OrderDate = "Aug 27, 2026",
                DeliveryDate = "Sep 02, 2026",
                Photos = new List<string>
                {
                    "Photo_1.jpg",
                    "Photo_2.jpg",
                    "Photo_3.jpg",
                    "Photo_4.jpg",
                    "Photo_5.jpg"
                }
            },
            new Customer
            {
                Id = "RA-1002",
                Name = "Fathima",
                Phone = "9876543211",
                AltPhone = "None",
                City = "Kochi",
                Address = "Flat 4B, Marine Drive Towers",
                Pincode = "682031",
                FrameSize = "8 × 12 inch",
                FrameType = "Premium Frame",
                Material = "Gold Filigree Resin",
                Color = "Antique Gold",
                Orientation = "Portrait",
                Quantity = 1,
                Notes = "Customer requested double velvet passe-partout matting.",
                TotalAmount = 2200,
                AdvancePaid = 2200,
                BalanceAmount = 0,
                PaymentStatus = "Paid",
                OrderStatus = "Pending",
                OrderDate = "Aug 26, 2026",
                DeliveryDate = "N/A",
                Photos = new List<string>
                {
                    "Family_Portrait.jpg",
                    "Landscape.jpg",
                    "Frame_Preview.jpg"
                }
            },
            new Customer
            {
                Id = "RA-1003",
                Name = "Rahul Raj",
                Phone = "9876543212",
                AltPhone = "None",
                City = "Kollam",
                Address = "Near Beach Road, Kadap ..",
                Pincode = "691001",
                FrameSize = "16 × 20 inch",
                FrameType = "Classic Frame",
                Material = "Natural Pine Wood",
                Color = "Matte Black",
                Orientation = "Landscape",
                Quantity = 4,
                Notes = "Standard clear glass with wall mounting brackets.",
                TotalAmount = 12000,
                AdvancePaid = 5000,
                BalanceAmount = 7000,
                PaymentStatus = "Partial",
                OrderStatus = "Pending",
                OrderDate = "Aug 25, 2026",
                DeliveryDate = "Aug 30, 2026",
                Photos = new List<string>
                {
                    "Portrait_1.jpg",
                    "Portrait_2.jpg"
                }
            },
            new Customer
            {
                Id = "RA-1004",
                Name = "Ananya Nair",
                Phone = "123456789",
                AltPhone = "None",
                City = "Kozhikode",
                Address = "12/450, Calicut Beach Av ..",
                Pincode = "673001",
                FrameSize = "20 × 30 inch",
                FrameType = "Canvas Float",
                Material = "Shadow Box Aluminium",
                Color = "Champagne Gold",
                Orientation = "Portrait",
                Quantity = 1,
                Notes = "Premium museum-grade anti-glare glass requested.",
                TotalAmount = 6800,
                AdvancePaid = 3000,
                BalanceAmount = 3800,
                PaymentStatus = "Partial",
                OrderStatus = "In Progress",
                OrderDate = "Aug 24, 2026",
                DeliveryDate = "Sep 02, 2026",
                Photos = new List<string>
                {
                    "Canvas_Art.jpg",
                    "Canvas_Art_2.jpg"
                }
            },
            new Customer
            {
                Id = "RA-1005",
                Name = "Deepak Varma",
                Phone = "9876543214",
                AltPhone = "None",
                City = "Kottayam",
                Address = "Kottayam Central",
                Pincode = "686001",
                FrameSize = "8 × 10 inch",
                FrameType = "Box Frame",
                Material = "Teak Wood Moulding",
                Color = "Walnut Brown",
                Orientation = "Square",
                Quantity = 3,
                Notes = "",
                TotalAmount = 3600,
                AdvancePaid = 1000,
                BalanceAmount = 2600,
                PaymentStatus = "Partial",
                OrderStatus = "Cancelled",
                OrderDate = "Aug 25, 2026",
                DeliveryDate = "N/A",
                Photos = new List<string>
                {
                    "Photo_1.jpg"
                }
            }
        };

        context.Customers.AddRange(seedCustomers);
        await context.SaveChangesAsync();
    }
}

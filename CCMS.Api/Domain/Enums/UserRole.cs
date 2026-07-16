namespace CCMS.Domain.Enums
{
    /// <summary>
    /// The three roles supported by CCMS (C-01).
    /// String values match exactly what the frontend (AuthContext / ProtectedRoute)
    /// sends and expects in the user.role field, so there's no translation layer needed.
    /// </summary>
    public enum UserRole
    {
        Student,
        ClubExecutive,
        Administrator
    }

    public static class UserRoleExtensions
    {
        // ASP.NET Core's [Authorize(Roles = "...")] and role claims work with strings,
        // and "Club Executive" (with a space) isn't a valid C# enum member name,
        // so we need an explicit mapping in both directions.
        public static string ToRoleString(this UserRole role) => role switch
        {
            UserRole.Student => "Student",
            UserRole.ClubExecutive => "Club Executive",
            UserRole.Administrator => "Administrator",
            _ => throw new ArgumentOutOfRangeException(nameof(role), role, "Unknown role")
        };

        public static UserRole FromRoleString(string roleString) => roleString switch
        {
            "Student" => UserRole.Student,
            "Club Executive" => UserRole.ClubExecutive,
            "Administrator" => UserRole.Administrator,
            _ => throw new ArgumentException($"Unknown role string: '{roleString}'", nameof(roleString))
        };
    }
}

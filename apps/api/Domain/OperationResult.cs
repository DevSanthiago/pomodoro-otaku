namespace Api.Domain;

public enum ResultStatus
{
    Success,
    Invalid,
    NotFound,
}

public sealed record OperationResult<T>(
    ResultStatus Status,
    T? Value,
    string? ErrorField,
    string? ErrorMessage)
{
    public static OperationResult<T> Success(T value) =>
        new(ResultStatus.Success, value, null, null);

    public static OperationResult<T> Invalid(string field, string message) =>
        new(ResultStatus.Invalid, default, field, message);

    public static OperationResult<T> NotFound() =>
        new(ResultStatus.NotFound, default, null, null);
}

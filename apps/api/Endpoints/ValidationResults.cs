using Api.Domain;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Api.Endpoints;

public static class ValidationResults
{
    public static ValidationProblem From<T>(OperationResult<T> result) =>
        TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            [result.ErrorField!] = [result.ErrorMessage!],
        });
}

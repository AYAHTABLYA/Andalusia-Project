using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.CommonResult;

public class Result
{
    private readonly List<Error> _errors = [];

    protected Result()
    {
    }

    protected Result(Error error)
    {
        _errors.Add(error);
    }

    protected Result(IEnumerable<Error> errors)
    {
        _errors.AddRange(errors);
    }

    public bool IsSuccess => _errors.Count == 0;
    public bool IsFailure => !IsSuccess;
    public IReadOnlyList<Error> Errors => _errors;

    public static Result Ok() => new();
    public static Result Fail(Error error) => new(error);
    public static Result Fail(IEnumerable<Error> errors) => new(errors);
}

public class Result<TValue> : Result
{
    private readonly TValue? _value;

    private Result(TValue value) : base()
    {
        _value = value;
    }

    private Result(Error error) : base(error)
    {
    }

    private Result(IEnumerable<Error> errors) : base(errors)
    {
    }

    public TValue Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Cannot access the value of a failed result.");

    public static Result<TValue> Ok(TValue value) => new(value);
    public new static Result<TValue> Fail(Error error) => new(error);
    public new static Result<TValue> Fail(IEnumerable<Error> errors) => new(errors);
}

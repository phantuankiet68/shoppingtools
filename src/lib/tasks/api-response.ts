export function successResponse(data: unknown, status = 200) {
    return Response.json(
        {
            success: true,
            data,
        },
        { status },
    );
}

export function errorResponse(message: string, status = 400) {
    return Response.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

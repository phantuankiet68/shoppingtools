import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

const ALLOWED_STATUS = ['TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE'] as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Status is required',
                },
                {
                    status: 400,
                },
            );
        }

        if (!ALLOWED_STATUS.includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid status',
                },
                {
                    status: 400,
                },
            );
        }

        const task = await prisma.task.findUnique({
            where: {
                id,
            },
        });

        if (!task) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Task not found',
                },
                {
                    status: 404,
                },
            );
        }

        const updateData: any = {
            status,
        };

        /**
         * Auto Progress
         */
        if (status === 'DONE') {
            updateData.progress = 100;
            updateData.completedAt = new Date();
        }

        if (status === 'TODO') {
            updateData.completedAt = null;
        }

        const updatedTask = await prisma.task.update({
            where: {
                id,
            },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            data: updatedTask,
            message: 'Task status updated successfully',
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            {
                status: 500,
            },
        );
    }
}

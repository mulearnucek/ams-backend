import { FastifyRequest, FastifyReply } from "fastify";
import { GradeEntry, GradeField } from "@/plugins/db/models/grade.models";
import { User } from "@/plugins/db/models/auth.model";

interface ListGradeEntriesQuery {
  page?: number;
  limit?: number;
  user?: string;
  grade_field?: string;
  is_absent?: boolean;
}

interface GetGradeEntryParams {
  id: string;
}

interface CreateGradeEntryBody {
  _id?: string;
  user: string;
  grade_field: string;
  mark: number;
  is_absent: boolean;
  remarks?: string;
}

interface BulkCreateGradeEntriesBody {
  entries: CreateGradeEntryBody[];
}

interface UpdateGradeEntryParams {
  id: string;
}

interface UpdateGradeEntryBody {
  user?: string;
  grade_field?: string;
  mark?: number;
  is_absent?: boolean;
  remarks?: string;
}

interface DeleteGradeEntryParams {
  id: string;
}

export const listGradeEntriesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { page = 1, limit = 10, user, grade_field, is_absent } = request.query as ListGradeEntriesQuery;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (user) filter.user = user;
    if (grade_field) filter.grade_field = grade_field;
    if (is_absent !== undefined) filter.is_absent = is_absent;

    const gradeEntries = await GradeEntry.find(filter)
      .populate("user", "first_name last_name email role")
      .populate({
        path: "grade_field",
        populate: [
          { path: "batch", select: "name adm_year department" },
          { path: "subject", select: "_id sem subject_code type" },
        ],
      })
      .skip(skip)
      .limit(limit)
      .sort({ updated_at: -1 });

    const total = await GradeEntry.countDocuments(filter);

    return reply.send({
      status_code: 200,
      message: "Grade entries retrieved successfully",
      data: {
        gradeEntries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return reply.status(500).send({
      status_code: 500,
      message: "Failed to retrieve grade entries",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getGradeEntryByIdHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as GetGradeEntryParams;

    const gradeEntry = await GradeEntry.findById(id)
      .populate("user", "first_name last_name email role")
      .populate({
        path: "grade_field",
        populate: [
          { path: "batch", select: "name adm_year department" },
          { path: "subject", select: "_id sem subject_code type" },
        ],
      });

    if (!gradeEntry) {
      return reply.status(404).send({
        status_code: 404,
        message: "Grade entry not found",
        data: "",
      });
    }

    return reply.send({
      status_code: 200,
      message: "Grade entry retrieved successfully",
      data: gradeEntry,
    });
  } catch (error) {
    return reply.status(500).send({
      status_code: 500,
      message: "Failed to retrieve grade entry",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createGradeEntryHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const gradeEntryData = request.body as CreateGradeEntryBody;

    // Validate user exists
    const user = await User.findById(gradeEntryData.user);
    if (!user) {
      return reply.status(404).send({
        status_code: 404,
        message: "User not found",
        data: "",
      });
    }

    // Validate grade field exists
    const gradeField = await GradeField.findById(gradeEntryData.grade_field);
    if (!gradeField) {
      return reply.status(404).send({
        status_code: 404,
        message: "Grade field not found",
        data: "",
      });
    }

    // Validate mark doesn't exceed total_mark
    if (gradeEntryData.mark > gradeField.total_mark) {
      return reply.status(422).send({
        status_code: 422,
        message: `Mark cannot exceed total mark of ${gradeField.total_mark}`,
        data: "",
      });
    }

    // Check if entry already exists for this user and grade field
    const existingEntry = await GradeEntry.findOne({
      user: gradeEntryData.user,
      grade_field: gradeEntryData.grade_field,
    });

    if (existingEntry) {
      return reply.status(422).send({
        status_code: 422,
        message: "Grade entry already exists for this user and grade field",
        data: "",
      });
    }

    // If absent, set mark to 0
    const entryData = {
      ...gradeEntryData,
      mark: gradeEntryData.is_absent ? 0 : gradeEntryData.mark,
      updated_at: new Date(),
    };

    const gradeEntry = await GradeEntry.create(entryData);

    const populatedGradeEntry = await GradeEntry.findById(gradeEntry._id)
      .populate("user", "first_name last_name email role")
      .populate({
        path: "grade_field",
        populate: [
          { path: "batch", select: "name adm_year department" },
          { path: "subject", select: "_id sem subject_code type" },
        ],
      });

    return reply.status(201).send({
      status_code: 201,
      message: "Grade entry created successfully",
      data: populatedGradeEntry,
    });
  } catch (error) {
    return reply.status(500).send({
      status_code: 500,
      message: "Failed to create grade entry",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const bulkCreateGradeEntriesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { entries } = request.body as BulkCreateGradeEntriesBody;

    const results = {
      successful: [] as any[],
      failed: [] as any[],
    };

    // Process each entry
    for (const entryData of entries) {
      try {
        // Validate user exists
        const user = await User.findById(entryData.user);
        if (!user) {
          results.failed.push({
            data: entryData,
            reason: "User not found",
          });
          continue;
        }

        // Validate grade field exists
        const gradeField = await GradeField.findById(entryData.grade_field);
        if (!gradeField) {
          results.failed.push({
            data: entryData,
            reason: "Grade field not found",
          });
          continue;
        }

        // Validate mark doesn't exceed total_mark
        if (entryData.mark > gradeField.total_mark) {
          results.failed.push({
            data: entryData,
            reason: `Mark cannot exceed total mark of ${gradeField.total_mark}`,
          });
          continue;
        }

        // Check if entry already exists
        const existingEntry = await GradeEntry.findOne({
          user: entryData.user,
          grade_field: entryData.grade_field,
        });

        if (existingEntry) {
          results.failed.push({
            data: entryData,
            reason: "Grade entry already exists",
          });
          continue;
        }

        // If absent, set mark to 0
        const finalData = {
          ...entryData,
          mark: entryData.is_absent ? 0 : entryData.mark,
          updated_at: new Date(),
        };

        const gradeEntry = await GradeEntry.create(finalData);
        results.successful.push(gradeEntry);
      } catch (error) {
        results.failed.push({
          data: entryData,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const statusCode = results.failed.length > 0 ? (results.successful.length > 0 ? 207 : 422) : 201;

    return reply.status(statusCode).send({
      status_code: statusCode,
      message: `Bulk create completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    return reply.status(500).send({
      status_code: 500,
      message: "Failed to bulk create grade entries",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateGradeEntryHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as UpdateGradeEntryParams;
    const updateData = request.body as UpdateGradeEntryBody;

    // Check if grade entry exists
    const gradeEntry = await GradeEntry.findById(id);
    if (!gradeEntry) {
      return reply.status(404).send({
        status_code: 404,
        message: "Grade entry not found",
        data: "",
      });
    }

    // Validate user if provided
    if (updateData.user) {
      const user = await User.findById(updateData.user);
      if (!user) {
        return reply.status(404).send({
          status_code: 404,
          message: "User not found",
          data: "",
        });
      }
    }

    // Validate grade field if provided
    let gradeField = await GradeField.findById(gradeEntry.grade_field);
    if (updateData.grade_field) {
      gradeField = await GradeField.findById(updateData.grade_field);
      if (!gradeField) {
        return reply.status(404).send({
          status_code: 404,
          message: "Grade field not found",
          data: "",
        });
      }
    }

    // Validate mark doesn't exceed total_mark
    if (updateData.mark !== undefined && gradeField) {
      if (updateData.mark > gradeField.total_mark) {
        return reply.status(422).send({
          status_code: 422,
          message: `Mark cannot exceed total mark of ${gradeField.total_mark}`,
          data: "",
        });
      }
    }

    // Check for duplicate if user or grade_field is being updated
    if (updateData.user || updateData.grade_field) {
      const targetUser = updateData.user ?? gradeEntry.user;
      const targetGradeField = updateData.grade_field ?? gradeEntry.grade_field;

      const existingEntry = await GradeEntry.findOne({
        user: targetUser,
        grade_field: targetGradeField,
        _id: { $ne: id },
      });

      if (existingEntry) {
        return reply.status(422).send({
          status_code: 422,
          message: "Grade entry already exists for this user and grade field",
          data: "",
        });
      }
    }

    // If is_absent is set to true, set mark to 0
    if (updateData.is_absent === true) {
      updateData.mark = 0;
    }

    // Update timestamp
    const finalUpdateData = {
      ...updateData,
      updated_at: new Date(),
    };

    const updatedGradeEntry = await GradeEntry.findByIdAndUpdate(id, finalUpdateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "first_name last_name email role")
      .populate({
        path: "grade_field",
        populate: [
          { path: "batch", select: "name adm_year department" },
          { path: "subject", select: "_id sem subject_code type" },
        ],
      });

    return reply.send({
      status_code: 200,
      message: "Grade entry updated successfully",
      data: updatedGradeEntry,
    });
  } catch (error) {
    return reply.status(500).send({
      status_code: 500,
      message: "Failed to update grade entry",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteGradeEntryHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as DeleteGradeEntryParams;

    const gradeEntry = await GradeEntry.findByIdAndDelete(id);

    if (!gradeEntry) {
      return reply.status(404).send({
        status_code: 404,
        message: "Grade entry not found",
        data: "",
      });
    }

    return reply.send({
      status_code: 200,
      message: "Grade entry deleted successfully",
      data: gradeEntry,
    });
  } catch (error) {
    return reply.status(500).send({
      status_code: 500,
      message: "Failed to delete grade entry",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

import { Request, Response } from "express";
import People from "../models";

// Get all people
export const getAllPeople = async (req: Request, res: Response) => {
  try {
    const people = await People.findAll();
    res.json(people);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a new people
export const createPeople = async (req: Request, res: Response) => {
  try {
    const { error } = peopleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const people = await People.create(req.body);
    res.status(201).json(people);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a specific people by ID
export const getPeopleById = async (req: Request, res: Response) => {
  try {
    const people = await People.findByPk(req.params.peopleId);
    if (!people) return res.status(404).json({ error: "People not found" });
    res.json(people);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update an people’s profile
export const updatePeople = async (req: Request, res: Response) => {
  try {
    const { error } = peopleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const people = await People.findByPk(req.params.peopleId);
    if (!people) return res.status(404).json({ error: "People not found" });

    await people.update(req.body);
    res.json(people);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Remove an people
export const deletePeople = async (req: Request, res: Response) => {
  try {
    const people = await People.findByPk(req.params.peopleId);
    if (!people) return res.status(404).json({ error: "People not found" });

    await people.destroy();
    res.json({ message: "People removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const peopleUpload = async (req: Request, res: Response) => {
  try {
    // Get the people array from the request body
    const people = req.body;

    // Ensure that the data is an array
    if (!Array.isArray(people) || people.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid input. Expecting an array of people." });
    }

    // Insert people into the database in bulk
    const createdPeople = await People.bulkCreate(people, {
      validate: true,
    });

    // Respond with the successfully created people
    res.status(201).json({
      message: "People uploaded successfully",
      data: createdPeople,
    });
  } catch (error) {
    res.status(400).json({ error: (error as any).message });
  }
};

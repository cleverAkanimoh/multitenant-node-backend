import ModelViewSet from "../../../shared/controllers/ModelViewset";
import People from "../models";
import { PeopleSchema } from "../schemas";

const PeopleController = new ModelViewSet({
  model: People,
  schema: PeopleSchema,
  name: "",
});

export default PeopleController;

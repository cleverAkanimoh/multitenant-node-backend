import ModelViewSet from "../../../shared/controllers/ModelViewset";
import People from "../models";

const PeopleController = new ModelViewSet({
  model: People,
  schema: peopleSchema,
  name: "",
});

export default PeopleController;

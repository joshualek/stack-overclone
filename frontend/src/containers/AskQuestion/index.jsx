import FormInput from "../../components/FormInput"; // adjust path as needed

function AskQuestion({ user }) {
  return (
    <main className="container-lg mb-3">
      <h1 className="mb-4">Ask a Question</h1>
      <FormInput
        user={user}
        mode="add"
        initialData={{ title: "", body: "", tags: [] }}
      />
    </main>
  );
}

export default AskQuestion;

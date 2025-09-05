import { useState } from "react";
import { FormRenderer } from "./renderer/FormRenderer";
import { sampleSchema } from "./demo/sampleSchema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { chargingPeriodSchema } from "./demo/chargingPeriodSchema";

function App() {
  const [submittedData, setSubmittedData] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    console.log("Form submitted with ID:", data.id);
    console.log("Form data:", data.formData);
    setSubmittedData(data);

    toast({
      title: "Form Submitted Successfully",
      description: `Form ID: ${data.id}. Check the console for details.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Form Renderer POC</h1>
          <p className="text-muted-foreground">
            Dynamic form engine with JSONLogic rules, responsive layouts, and
            shadcn components
          </p>
        </div>

        <Tabs defaultValue="form" className="space-y-4">
          <TabsList>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4">
            <FormRenderer
              schema={chargingPeriodSchema}
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="schema">
            <Card>
              <CardHeader>
                <CardTitle>Form Schema</CardTitle>
                <CardDescription>
                  The JSON schema that defines the form structure and rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                  <pre className="text-sm">
                    {JSON.stringify(sampleSchema, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="result">
            <Card>
              <CardHeader>
                <CardTitle>Submitted Data</CardTitle>
                <CardDescription>
                  The data submitted from the form (after processing)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submittedData ? (
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <pre className="text-sm">
                      {JSON.stringify(submittedData, null, 2)}
                    </pre>
                  </ScrollArea>
                ) : (
                  <p className="text-muted-foreground">
                    No data submitted yet. Fill out and submit the form to see
                    the result.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Dynamic form rendering from JSON schema</li>
                    <li>JSONLogic rule engine for conditional logic</li>
                    <li>
                      Responsive grid layouts with row/column configuration
                    </li>
                    <li>Field visibility and enable/disable rules</li>
                    <li>Conditional validation with Zod</li>
                    <li>Multi-section navigation (tabs/stepper)</li>
                    <li>Remote data fetching for select options</li>
                    <li>Placeholder resolution with globals and form values</li>
                    <li>React Hook Form integration</li>
                    <li>All UI components from shadcn/ui</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Demo Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Age-based visibility:</strong> The
                      "Identification" section only appears when age ≥ 18
                    </li>
                    <li>
                      <strong>Conditional fields:</strong> SSN field appears
                      only when checkbox is checked
                    </li>
                    <li>
                      <strong>PAN number rule:</strong> Enabled when age ≥ 18
                      and country is not USA
                    </li>
                    <li>
                      <strong>Dynamic validation:</strong> SSN and PAN
                      validation only applies when fields are visible/enabled
                    </li>
                    <li>
                      <strong>Global placeholders:</strong> Department field
                      auto-fills from globals
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Try These Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>
                      Enter age less than 18 - the Identification section will
                      hide
                    </li>
                    <li>
                      Enter age 18 or more - the Identification section will
                      appear
                    </li>
                    <li>
                      Check "I have SSN" - the SSN field will appear with
                      validation
                    </li>
                    <li>
                      Change globals.country to "India" - PAN field will be
                      enabled
                    </li>
                    <li>
                      Try submitting with validation errors - see inline error
                      messages
                    </li>
                    <li>
                      Navigate between sections - validation prevents moving
                      forward with errors
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}

export default App;

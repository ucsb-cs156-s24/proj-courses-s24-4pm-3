import { fireEvent, render, screen } from "@testing-library/react";
import { fiveSections, gigaSections } from "fixtures/sectionFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import SectionsTable from "main/components/Sections/SectionsTable";
import { objectToAxiosParams } from "main/components/Sections/SectionsTable";
import { handleAddToSchedule } from "main/components/Sections/SectionsTable";
import {onSuccess} from "main/components/Sections/SectionsTable";
import { useBackendMutation } from "main/utils/useBackend";
import { useBackend } from "main/utils/useBackend";
import AddToScheduleModal from 'main/components/PersonalSchedules/AddToScheduleModal';

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

jest.mock("react-toastify", () => ({
  toast: jest.fn(),
}));

jest.mock("main/utils/useBackend", () => ({
  useBackendMutation: jest.fn(),
}));

describe('handleAddToSchedule', () => {
  it('calls mutate with correct data', () => {
    const mockMutation = { mutate: jest.fn() };
    const mockSection = { section: { enrollCode: '123' } };
    const mockSchedule = '456';

    handleAddToSchedule(mockSection, mockSchedule, mockMutation);

    expect(mockMutation.mutate).toHaveBeenCalledWith({
      enrollCd: '123',
      psId: '456',
    });
  });
});

describe('objectToAxiosParams', () => {
  it('should return the correct axios parameters', () => {
    const data = {
      enrollCd: 12345,
      psId: 15,
    };

    const result = objectToAxiosParams(data);

    expect(result).toEqual({
      url: "/api/courses/post",
      method: "POST",
      params: {
        enrollCd: '12345',
        psId: '15',
      },
    });
  });
});

describe("Section tests", () => {
  const queryClient = new QueryClient();

  test("calls onSuccess when mutation is successful and calls toast with correct parameters", () => {
    const mockMutate = jest.fn();
    const mockMutation = { mutate: mockMutate };
  
    useBackendMutation.mockReturnValue(mockMutation);
  
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SectionsTable sections={fiveSections} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  
    // Call the onSuccess function
    const onSuccess = useBackendMutation.mock.calls[0][1].onSuccess;
    const mockResponse = [{ id: 1, enrollCd: "1234" }];
    onSuccess(mockResponse);
  
    // Verify that toast was called with the correct parameters
    expect(toast).toHaveBeenCalledWith("New course Created - id: 1 enrollCd: 1234");
  });

  test("renders without crashing for empty table", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SectionsTable sections={[]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("Has the expected cell values when expanded", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SectionsTable sections={fiveSections} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "Quarter",
      "Course ID",
      "Title",
      "Status",
      "Enrolled",
      "Location",
      "Days",
      "Time",
      "Instructor",
      "Enroll Code",
      "Info",
    ];
    const expectedFields = [
      "quarter",
      "courseInfo.courseId",
      "courseInfo.title",
      "status",
      "enrolled",
      "location",
      "days",
      "time",
      "instructor",
      "section.enrollCode",
      "info",
    ];
    const testId = "SectionsTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    const expandRow = screen.getByTestId(
      `${testId}-cell-row-1-col-courseInfo.courseId-expand-symbols`,
    );
    fireEvent.click(expandRow);

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-quarter`),
    ).toHaveTextContent("W22");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-time`),
    ).toHaveTextContent("3:00 PM - 3:50 PM");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-days`),
    ).toHaveTextContent("M");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-status`),
    ).toHaveTextContent("Open");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-enrolled`),
    ).toHaveTextContent("84/100");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-location`),
    ).toHaveTextContent("HFH 1124");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-instructor`),
    ).toHaveTextContent("YUNG A S");
  });

  test("Has the expected column headers and content", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SectionsTable sections={fiveSections} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "Quarter",
      "Course ID",
      "Title",
      "Status",
      "Enrolled",
      "Location",
      "Days",
      "Time",
      "Instructor",
      "Enroll Code",
    ];
    const expectedFields = [
      "quarter",
      "courseInfo.courseId",
      "courseInfo.title",
      "status",
      "enrolled",
      "location",
      "days",
      "time",
      "instructor",
      "section.enrollCode",
    ];
    const testId = "SectionsTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-courseInfo.courseId`),
    ).toHaveTextContent("ECE 1A");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-courseInfo.title`),
    ).toHaveTextContent("COMP ENGR SEMINAR");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-quarter`),
    ).toHaveTextContent("W22");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-time`),
    ).toHaveTextContent("3:00 PM - 3:50 PM");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-days`),
    ).toHaveTextContent("M");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-status`),
    ).toHaveTextContent("Open");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-enrolled`),
    ).toHaveTextContent("84/100");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-location`),
    ).toHaveTextContent("BUCHN 1930");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-instructor`),
    ).toHaveTextContent("WANG L C");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-section.enrollCode`),
    ).toHaveTextContent("12583");
  });

  test("Correctly groups separate lectures of the same class", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SectionsTable sections={gigaSections} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const testId = "SectionsTable";

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-courseInfo.courseId`),
    ).toHaveTextContent("➕ MATH 3B");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-courseInfo.courseId`),
    ).toHaveTextContent("➕ MATH 3B");

    const expandRow = screen.getByTestId(
      `${testId}-cell-row-1-col-courseInfo.courseId-expand-symbols`,
    );
    fireEvent.click(expandRow);

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-courseInfo.courseId`),
    ).toHaveTextContent("➖ MATH 3B");
  });

  test("First dropdown is different than last dropdown", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SectionsTable sections={fiveSections} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const testId = "SectionsTable";

    const expandRow = screen.getByTestId(
      `${testId}-cell-row-1-col-courseInfo.courseId-expand-symbols`,
    );
    fireEvent.click(expandRow);

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-enrolled`),
    ).toHaveTextContent("84/80");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-enrolled`),
    ).toHaveTextContent("21/21");
  });

  test("Status utility identifies each type of status", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SectionsTable sections={fiveSections} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const testId = "SectionsTable";

    const expandRow = screen.getByTestId(
      `${testId}-cell-row-1-col-courseInfo.courseId-expand-symbols`,
    );
    fireEvent.click(expandRow);

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-status`),
    ).toHaveTextContent("Closed");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-status`),
    ).toHaveTextContent("Full");
    expect(
      screen.getByTestId(`${testId}-cell-row-3-col-status`),
    ).toHaveTextContent("Cancelled");
    expect(
      screen.getByTestId(`${testId}-cell-row-4-col-status`),
    ).toHaveTextContent("Open");
  });

  test("Info link is correct", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SectionsTable sections={fiveSections} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const testId = "SectionsTable";

    const expandRow = screen.getByTestId(
      `${testId}-cell-row-1-col-courseInfo.courseId-expand-symbols`,
    );
    fireEvent.click(expandRow);

    expect(
      screen
        .getByTestId(`${testId}-cell-row-1-col-info`)
        .querySelector('a[href$="/coursedetails/20221/12591"]'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByTestId(`${testId}-cell-row-2-col-info`)
        .querySelector('a[href$="/coursedetails/20221/12609"]'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByTestId(`${testId}-cell-row-3-col-info`)
        .querySelector('a[href$="/coursedetails/20221/12617"]'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByTestId(`${testId}-cell-row-4-col-info`)
        .querySelector('a[href$="/coursedetails/20221/12625"]'),
    ).toBeInTheDocument();
  });
});

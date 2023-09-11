/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import "./styles.css";

type FormValues = {
  firstName: string;
};

export default function App() {
  const { register, handleSubmit } = useForm<FormValues>();
  const onSubmit = (data: FormValues) => console.info("Submit RootForm", data);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("firstName")} placeholder="First Name" />
        <ModalInput
          onChange={(data) => {
            console.info("ModalInput Change", data);
          }}
        />
        <input type="submit" />
      </form>
    </div>
  );
}

const ModalInput = (props: { onChange: (data: any) => void }) => {
  const [isModalVisible, setModalVisible] = React.useState(false);

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  const forwardChange = (data: any) => {
    hideModal();
    props.onChange(data);
  };

  /**
   * Issue #1: Random button triggering submit onClick
   * https://www.w3.org/TR/2011/WD-html5-20110525/the-button-element.html#the-button-element
   * button is of type submit by default
   * Fix #1: Add type="button" to button components
   */

  return (
    <>
      {/* Will trigger a submit because default button type is "submit" */}
      <button className="button" onClick={showModal}>
        Open Nested Form (Error)
      </button>
      <button type="button" className="button" onClick={showModal}>
        Open Nested Form (No Error)
      </button>
      {isModalVisible && (
        <ModalForm onSave={forwardChange} onClose={hideModal} />
      )}
    </>
  );
};

const ModalForm = (props: {
  onSave: (data: any) => void;
  onClose: () => void;
}) => {
  const { register, handleSubmit } = useForm();

  /**
   * Issue #3: Submit event still propagates to parent when using portal
   * https://reactjs.org/docs/portals.html#event-bubbling-through-portals
   * Event bubbling goes through React DOM instead of HTML DOM
   * Portals don't have an effect on this one, we need to stop event propagation
   * This should be our default form handling method
   */

  const forwardSave = (data: any) => {
    console.info("Submit ModalForm", data);
    props.onSave(data);
  };

  const handleSubmitWithoutPropagation = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(forwardSave)(e);
  };

  return (
    <ModalPortal>
      <div className="modal">
        <div className="modal_content">
          <form onSubmit={handleSubmitWithoutPropagation}>
            <input
              {...register("modalInputValue")}
              placeholder="Modal Input Value"
            />
            <input type="submit" />
            <button type="button" className="button" onClick={props.onClose}>
              Close modal
            </button>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

const modalDiv = document.getElementById("modals");

const ModalPortal = (props: any) => {
  /**
   * Issue #2: Cannot nest forms directly in DOM
   * https://html.spec.whatwg.org/multipage/forms.html#the-form-element
   * This is a basic html spec, the fix is using portals to unest Modals
   * https://reactjs.org/docs/portals.html
   */
  return createPortal(props.children, modalDiv!);
};
